import re
import os
import json
import shutil
from time import time
import uuid
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import asc, desc, or_, String, func
from typing import List, Optional
from decimal import Decimal
from fastapi.responses import Response
from supabase import create_client, Client
from math import ceil

from models.user import User
from models.category import Category
from models.product import Product, ProductImage, ProductVariant
from models.wishlist import Wishlist
from schemas.product import ProductCreate, ProductResponse, ProductListResponse
from database import SessionLocal
from utils.dependencies import admin_only, get_optional_current_user


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(prefix="/products", tags=["products"])

def generate_slug(name: str, db: Session, current_id: int = None) -> str:
    """
    Generate a clean, URL-friendly slug from product name.
    Example: "Fresh Organic Tomatoes" -> "fresh-organic-tomatoes"
    If duplicate exists, adds counter: "fresh-organic-tomatoes-2"
    Never includes product ID in the slug (only counter for duplicates).
    """
    if not name:
        return f"product-{current_id or 0}"
    
    # Step 1: Normalize the name
    # Convert to lowercase, remove special characters, replace spaces with hyphens
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    base_slug = re.sub(r'[\s_-]+', '-', normalized).strip('-')
    
    # Step 2: Remove multiple consecutive hyphens
    base_slug = re.sub(r'-+', '-', base_slug)
    
    # Step 3: Handle edge case - if slug is empty after cleaning
    if not base_slug or base_slug == '-':
        base_slug = f"product-{current_id or int(time.time())}"
    
    # Step 4: Check for duplicates and add counter if needed
    slug = base_slug
    counter = 1
    
    while True:
        # Build query to check if slug exists for a different product
        query = db.query(Product).filter(Product.slug == slug)
        if current_id:
            query = query.filter(Product.id != current_id)
        
        existing = query.first()
        
        if not existing:
            break
        
        # Slug exists, append counter
        slug = f"{base_slug}-{counter}"
        counter += 1
        
        # Safety: prevent infinite loop (max 1000 attempts)
        if counter > 1000:
            slug = f"{base_slug}-{current_id or int(time.time())}"
            break
    
    return slug

def get_filename_from_url(url: str) -> str:
    return url.split("/")[-1]

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------------------------------------------ #
#  STATIC / SPECIFIC routes MUST come before wildcard /{slug} route  #
# ------------------------------------------------------------------ #

@router.get("/seo/sitemap.xml")
def get_sitemap(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    base_url = "https://ngau-bazaar.vercel.app"

    xml_items = []
    xml_items.append(f"<url><loc>{base_url}/</loc><priority>1.0</priority></url>")
    xml_items.append(f"<url><loc>{base_url}/shop</loc><priority>0.8</priority></url>")

    for p in products:
        xml_items.append(f"<url><loc>{base_url}/product/{p.slug}</loc><priority>0.7</priority></url>")

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        {"".join(xml_items)}
    </urlset>"""

    return Response(content=xml_content, media_type="application/xml")


# ---------------- GET PRODUCTS (PUBLIC) ----------------
@router.get("/", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),
    user=Depends(get_optional_current_user),

    # Filters
    search: str | None = Query(None, description="Search by product name"),
    category: str | None = Query(None, description="Category ID or slug (e.g. fruits)"),
    tag: str | None = Query(None, description="Filter by a specific tag"),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),

    # Pagination
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),

    # Sorting
    sort: str | None = Query(
        None,
        description="price_asc | price_desc | name_asc | name_desc | popularity | newest"
    ),
):
    # FIX 3: Validate price range before querying
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=422,
            detail="min_price cannot be greater than max_price"
        )

    # FIX 3: Build a base query WITHOUT eager-load options for the COUNT.
    # joinedload adds a JOIN that can inflate COUNT(*) when one-to-many
    # relationships are involved. We count on a clean query, then fetch
    # the full data with options on a separate query.
    base_query = db.query(Product)

    # --- Apply all filters to base_query ---
    if search:
        base_query = base_query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.tags.cast(String).ilike(f"%{search}%")
            )
        )

    if category:
        if category.isdigit():
            base_query = base_query.filter(Product.category_id == int(category))
        else:
            base_query = (
                base_query
                .join(Category)
                .filter(Category.name.ilike(f"%{category}%"))
            )

    if tag:
        base_query = base_query.filter(Product.tags.cast(String).ilike(f"%{tag}%"))

    if min_price is not None:
        base_query = base_query.filter(Product.price >= min_price)
    if max_price is not None:
        base_query = base_query.filter(Product.price <= max_price)

    # FIX 4: nulls_last() on popularity so new products (view_count=None)
    # don't bubble to the top when sorting by popularity DESC.
    sort_map = {
        "price_asc":  asc(Product.price),
        "price_desc": desc(Product.price),
        "name_asc":   asc(Product.name),
        "name_desc":  desc(Product.name),
        "popularity": desc(Product.view_count).nulls_last(),
        "newest":     desc(Product.created_at),
    }
    order_clause = sort_map.get(sort, desc(Product.id))

    # FIX 3: COUNT on the clean filtered query (no joinedload)
    total = base_query.count()

    # Now build the data query with eager-loading options + sorting + pagination
    products = (
        base_query
        .options(
            joinedload(Product.category),   # many-to-one: safe with joinedload
            selectinload(Product.images),   # one-to-many: use selectinload
            selectinload(Product.variants)  # one-to-many: use selectinload
        )
        .order_by(order_clause)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    total_pages = ceil(total / limit) if total > 0 else 1

    if user:
        wishlist_ids = {
            item.product_id for item in
            db.query(Wishlist.product_id).filter(Wishlist.user_id == user.id).all()
        }
        for p in products:
            p.is_in_wishlist = p.id in wishlist_ids
    else:
        for p in products:
            p.is_in_wishlist = False

    # FIX 1: Return "data" and "totalPages" (camelCase) to match frontend expectations.
    # Previously returned "items" and "total_pages" which caused the field-name mismatch
    # that made the frontend fall back to treating the response as a bare array.
    return {
        "data": products,        # was "items"  — frontend looks for "data"
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages  # was "total_pages" — frontend looks for "totalPages"
    }


# ---------------- GET BY ID ----------------
# FIX 2: Specific routes /id/{product_id} and /{product_id}/related are declared
# BEFORE the wildcard /{slug} route. Previously /{slug} swallowed all of them
# because FastAPI matches top-to-bottom and "id" is a valid slug value.

@router.get("/id/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        selectinload(Product.images),
        selectinload(Product.variants),
        joinedload(Product.category)
    ).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# ---------------- RELATED PRODUCTS ----------------
# FIX 2 (continued): Moved above /{slug} so it is reachable.
# FIX 4: Changed joinedload(Product.images) → selectinload to stay consistent
# with every other route and avoid duplicate rows on one-to-many joins.

@router.get("/{product_id}/related", response_model=List[ProductResponse])
def get_related_products(product_id: int, db: Session = Depends(get_db)):
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Product not found")

    related = db.query(Product).options(
        selectinload(Product.images),   # was joinedload — caused duplicate rows
        joinedload(Product.category)
    ).filter(
        Product.category_id == target.category_id,
        Product.id != product_id
    ).limit(4).all()

    return related


# ---------------- GET BY SLUG (wildcard — must be last) ----------------
# FIX 2: This wildcard route is now declared LAST so the specific routes
# /id/{product_id}, /{product_id}/related, and /seo/sitemap.xml are
# always matched first and never accidentally caught here.

@router.get("/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        selectinload(Product.images),
        selectinload(Product.variants),
        joinedload(Product.category)
    ).filter(Product.slug == slug).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# ---------------- CREATE PRODUCT (ADMIN) ----------------
@router.post("/", response_model=ProductResponse)
async def add_product(
    name: str = Form(...),
    price: Decimal = Form(...),
    unit: str = Form("pc"),
    category_id: int = Form(...),
    quantity: int = Form(0),
    stock: int = Form(0),
    description: str | None = Form(None),
    tags: str | None = Form(None),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only),
):
    if not db.query(Category).filter(Category.id == category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")

    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    slug =  generate_slug(name, db)

    db_product = Product(
        name=name,
        slug=slug,
        price=price,
        unit=unit,
        category_id=category_id,
        quantity=quantity or 0,
        stock=stock or 0,
        description=description or "",
        tags=tags_list
    )
    try:
        db.add(db_product)
        db.flush()

        for file in files:
            file_extension = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{file_extension}"

            file_content = await file.read()

            supabase_client.storage.from_(BUCKET_NAME).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": file.content_type}
            )
            public_url = supabase_client.storage.from_(BUCKET_NAME).get_public_url(unique_filename)
            url_str = public_url if isinstance(public_url, str) else public_url.get("publicURL", str(public_url))

            db.add(ProductImage(
                product_id=db_product.id,
                url=url_str
            ))

        db.commit()
        db.refresh(db_product)
        return db_product

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")


# ---------------- UPDATE PRODUCT (ADMIN) ----------------
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    name: str = Form(...),
    price: Decimal = Form(...),
    unit: str = Form(...),
    category_id: int = Form(...),
    quantity: int = Form(...),
    stock: int = Form(...),
    description: str | None = Form(None),
    tags: str | None = Form(None),
    remove_image_ids: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.name != name:
        product.slug = generate_slug(name, db, current_id=product_id)

    product.name = name
    product.price = price
    product.unit = unit
    product.category_id = category_id
    product.quantity = quantity
    product.stock = stock
    product.description = description if description is not None else ""

    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        product.tags = tag_list
    else:
        product.tags = []

    try:
        images_to_delete = []

        if remove_image_ids:
            id_list = [int(id_str) for id_str in remove_image_ids.split(",") if id_str.strip()]
            images_to_delete = db.query(ProductImage).filter(
                ProductImage.id.in_(id_list)
            ).all()

        if images_to_delete:
            filename = [get_filename_from_url(img.url) for img in images_to_delete]
            supabase_client.storage.from_(BUCKET_NAME).remove(filename)

            for img in images_to_delete:
                db.delete(img)

        if files:
            for file in files:
                file_extension = file.filename.split(".")[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                file_content = await file.read()

                supabase_client.storage.from_(BUCKET_NAME).upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type": file.content_type}
                )

                res = supabase_client.storage.from_(BUCKET_NAME).get_public_url(unique_filename)
                db.add(ProductImage(
                    product_id=product.id,
                    url=str(res)
                ))

        db.commit()
        db.refresh(product)
        return product

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")


# ---------------- DELETE PRODUCT (ADMIN) ----------------
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    filenames = [get_filename_from_url(img.url) for img in product.images]

    try:
        db.delete(product)
        db.commit()
        if filenames:
            supabase_client.storage.from_(BUCKET_NAME).remove(filenames)
        return {"detail": "Product and files deleted successfully"}
    except Exception as e:
        db.rollback()
        if "foreign key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Linked to existing orders/carts.")
        raise HTTPException(status_code=500, detail="Internal server error.")


# ---------------- INCREMENT VIEW COUNT ----------------
@router.post("/{product_id}/view")
def increment_view(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.view_count = (product.view_count or 0) + 1
        db.commit()
    return {"status": "success"}
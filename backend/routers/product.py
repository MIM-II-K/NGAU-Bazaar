import re
import os
import json
import shutil
import uuid
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, or_, String
from typing import List, Optional
from decimal import Decimal
from supabase import create_client, Client

from models.user import User
from models.category import Category
from models.product import Product, ProductImage, ProductVariant
from schemas.product import ProductCreate, ProductResponse
from database import SessionLocal
from utils.dependencies import admin_only

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(prefix="/products", tags=["products"])

def generate_slug(name: str) -> str:
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub('[\s_-]+', '-', normalized).strip('-')

    return f"{slug}-{str(uuid.uuid4())[:8]}"

def get_filename_from_url(url: str) -> str:
    return url.split("/")[-1]

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- GET PRODUCTS (PUBLIC) ----------------
@router.get("/", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db),

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
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images))

    #Search
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.tags.cast(String).ilike(f"%{search}%")
                )
        )

    #Category filter
    if category:
    # numeric → category_id
        if category.isdigit():
            query = query.filter(Product.category_id == int(category))
        else:
        # slug/name → join Category
            query = (
                query
                .join(Category)
                .filter(Category.name.ilike(f"%{category}%"))
            )
    if tag:
        query = query.filter(Product.tags.cast(String).ilike(f"%{tag}%"))

    #Price filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    #Sorting
    sort_map = {
        "price_asc": asc(Product.price),
        "price_desc": desc(Product.price),
        "name_asc": asc(Product.name),
        "name_desc": desc(Product.name),
        "popularity": desc(Product.view_count),
        "newest": desc(Product.created_at)
    }
    query = query.order_by(sort_map.get(sort, desc(Product.id)))

    #Pagination
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()


@router.get("/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    # 1. Try exact match in the DB column
    product = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.category)
    ).filter(Product.slug == slug).first()
    
    # 2. If not found, manually check against generated slugs (Temporary Fix)
    if not product:
        products = db.query(Product).options(joinedload(Product.images)).all()
        for p in products:
            # This generates 'coffee-beans' from 'Coffee Beans' on the fly
            normalized = re.sub(r'[^\w\s-]', '', p.name.lower())
            generated = re.sub(r'[\s_-]+', '-', normalized).strip('-')
            if generated == slug:
                product = p
                break

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.get("/id/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.category)
    ).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

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
    # 1. Verify Category
    if not db.query(Category).filter(Category.id == category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")
    
    tags_list=[t.strip() for t in tags.split(",") if t.strip()] if tags else []
    

    # 2. Initialize Product (Note: we no longer pass image_url here)
    db_product = Product(
        name=name,
        slug=generate_slug(name),
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

    # 3. Handle Multiple Image Uploads
        for file in files:
        # Generate unique filename
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
                product_id = db_product.id,
                url=url_str
           ))

        db.commit()
        db.refresh(db_product)
        return db_product
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create to create product: {str(e)}")


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
        product.slug = generate_slug(name)

    # 1. Update text fields
    product.name = name
    product.price = price
    product.unit = unit
    product.category_id = category_id
    product.quantity = quantity
    product.stock = stock
    product.description = description if description is not None else ""
    

    # --- CRITICAL JSON FIX FOR TAGS ---
    if tags:
        # Convert comma-separated string "tag1,tag2" to ["tag1", "tag2"]
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        product.tags = tag_list # SQLAlchemy handles the JSON serialization if the column type is JSON
    else:
        product.tags = [] # Send an empty list, which Postgres saves as '[]' (valid JSON)
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
        
    # 2. Handle Image Updates
        if files:
            for file in files:
                file_extension = file.filename.split(".")[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                file_content = await file.read()

                supabase_client.storage.from_(BUCKET_NAME).upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type":file.content_type}
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
    # 1. Find the product
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

@router.get("/{product_id}/related", response_model=List[ProductResponse])
def get_related_products(product_id: int, db: Session = Depends(get_db)):
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Product not found")
    
    related = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.category)
    ).filter(
        Product.category_id == target.category_id,
        Product.id != product_id
    ).limit(4).all()

    return related

@router.post("/{product_id}/view")
def increment_view(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.view_count = (product.view_count or 0) + 1
        db.commit()
    return {"status": "success"}
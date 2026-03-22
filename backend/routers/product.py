import re
import os
import json
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, or_, String
from typing import List, Optional
from decimal import Decimal

from models.user import User
from models.category import Category
from models.product import Product, ProductImage, ProductVariant
from schemas.product import ProductCreate, ProductResponse
from database import SessionLocal
from utils.dependencies import admin_only

router = APIRouter(prefix="/products", tags=["products"])

UPLOAD_DIR = "static/product_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_slug(name: str) -> str:
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub('[\s_-]+', '-', normalized).strip('-')

    return f"{slug}-{str(uuid.uuid4())[:8]}"

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

    # 🔍 Search
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.tags.cast(String).ilike(f"%{search}%")
                )
        )

    # 📂 Category filter
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

    # 💰 Price filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # 🔃 Sorting
    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "name_asc":
        query = query.order_by(asc(Product.name))
    elif sort == "name_desc":
        query = query.order_by(desc(Product.name))
    elif sort == "popularity":
        query = query.order_by(desc(Product.view_count))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at)) 
    else:
        query = query.order_by(desc(Product.id))  # newest first

    # 📄 Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    for p in products:
        if not isinstance(p.tags, list):
            p.tags = []

    return products

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

@router.get("/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    # First, try to find by the actual slug column (most efficient)
    product = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.category)
    ).filter(Product.slug == slug).first()
    
    # If not found in slug column, fallback to the regex matching logic
    if not product:
        products = db.query(Product).all()
        for p in products:
            normalized_name = re.sub(r'[^\w\s-]', '', p.name.lower())
            generated_slug = re.sub(r'[\s_-]+', '-', normalized_name).strip('-')
            if generated_slug == slug:
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
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    proudct_slug = generate_slug(name)

    # 2. Initialize Product (Note: we no longer pass image_url here)
    db_product = Product(
        name=name,
        slug=proudct_slug,
        price=price,
        unit=unit,
        category_id=category_id,
        quantity=quantity or 0,
        stock=stock or 0,
        description=description or "",
        tags=[t.strip() for t in tags.split(",") if t.strip()] if tags else []
    )
    
    db.add(db_product)
    db.commit() # Commit to get the db_product.id
    db.refresh(db_product)

    # 3. Handle Multiple Image Uploads
    for file in files:
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Create ProductImage entry linking to this product
        new_image = ProductImage(
            product_id=db_product.id,
            url=f"/static/product_images/{unique_filename}"
        )
        db.add(new_image)

    # 4. Final Commit
    db.commit()
    db.refresh(db_product)

    return db_product


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

    if remove_image_ids:
        try:
            id_list = [int(id_str) for id_str in remove_image_ids.split(",") if id_str.strip()]
            images_to_delete = db.query(ProductImage).filter(
                ProductImage.id.in_(id_list),
                ProductImage.product_id == product_id
            ).all()

            for img in images_to_delete:
                # Optional: Delete the actual file from storage
                # file_path = img.url.lstrip('/')
                # if os.path.exists(file_path): os.remove(file_path)
                db.delete(img)
        except ValueError:
            pass
        
    # 2. Handle Image Updates
    if files and len(files) > 0:
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()

        for file in files:
            file_extension = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
            new_img = ProductImage(
                product_id=product.id, 
                url=f"/static/product_images/{unique_filename}"
            )
            db.add(new_img)

    db.commit()
    
    # 3. Refresh with joined options
    product = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.category)
    ).filter(Product.id == product_id).first()

    if not isinstance(product.tags, list):
        product.tags = []

    return product


# ---------------- DELETE PRODUCT (ADMIN) ----------------
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    # 1. Find the product
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        # 2. Attempt the delete
        db.delete(product)
        db.commit()
        return {"detail": "Product deleted successfully"}
        
    except Exception as e:
        # 3. CRITICAL: Rollback on error
        db.rollback()
        print(f"DELETE ERROR: {str(e)}") # Check your terminal to see the exact SQL error
        
        # Check if the error is due to an existing order
        if "foreign key" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete product: It is linked to existing orders or cart items."
            )
            
        raise HTTPException(status_code=500, detail="An internal server error occurred during deletion.")
    

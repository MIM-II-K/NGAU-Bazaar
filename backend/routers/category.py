from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.category import Category
from schemas.category import CategoryCreate, CategoryResponse
from database import SessionLocal
from utils.dependencies import admin_only

router = APIRouter(prefix="/categories", tags=["categories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- PUBLIC: GET ALL ----------------
@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# ---------------- ADMIN: CREATE ----------------
@router.post("/", response_model=CategoryResponse)
def add_category(category: CategoryCreate, db: Session = Depends(get_db), admin=Depends(admin_only)):
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


# ---------------- ADMIN: UPDATE ----------------
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryCreate, db: Session = Depends(get_db), admin=Depends(admin_only)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for duplicate name
    if db.query(Category).filter(Category.name == category.name, Category.id != category_id).first():
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return db_category


# ---------------- ADMIN: DELETE ----------------
@router.delete("/{category_id}", response_model=dict)
def delete_category(category_id: int, db: Session = Depends(get_db), admin=Depends(admin_only)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": f"Category '{db_category.name}' deleted successfully"}

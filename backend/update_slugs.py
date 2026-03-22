import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models.product import Product

def generate_slug(name: str) -> str:
    if not name:
        return ""
    # Matches your urlHelper.js and FastAPI logic
    normalized_name = re.sub(r'[^\w\s-]', '', name.lower())
    return re.sub(r'[\s_-]+', '-', normalized_name).strip('-')

def migrate_slugs():
    db: Session = SessionLocal()
    try:
        # 1. Fetch all products
        products = db.query(Product).all()
        print(f"Found {len(products)} products. Starting migration...")

        for product in products:
            new_slug = generate_slug(product.name)
            
            # 2. Update the slug column
            product.slug = new_slug
            print(f"Updated: {product.name} -> {new_slug}")

        # 3. Save changes
        db.commit()
        print("Successfully updated all product slugs!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_slugs()
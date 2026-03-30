import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models.product import Product

def generate_clean_slug(name: str, db: Session, current_product_id: int) -> str:
    """
    Generates a URL-friendly slug and ensures uniqueness within the database.
    """
    if not name:
        return f"product-{current_product_id}"

    # 1. Basic normalization (lowercase, remove special chars)
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    # 2. Replace spaces/underscores with dashes
    base_slug = re.sub(r'[\s_-]+', '-', normalized).strip('-')
    
    # 3. Collision Handling: Check if this slug is already taken by ANOTHER product
    slug = base_slug
    counter = 1
    
    while True:
        existing = db.query(Product).filter(
            Product.slug == slug, 
            Product.id != current_product_id
        ).first()
        
        if not existing:
            break
        
        # If slug exists, append a counter (e.g., organic-kiwi-1)
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    return slug

def migrate_slugs():
    db: Session = SessionLocal()
    try:
        # Fetch all products to update
        products = db.query(Product).all()
        print(f"Found {len(products)} products. Starting slug cleanup...")

        updated_count = 0
        for product in products:
            old_slug = product.slug
            new_slug = generate_clean_slug(product.name, db, product.id)
            
            if old_slug != new_slug:
                product.slug = new_slug
                print(f"Updated: '{product.name}'\n   From: {old_slug}\n   To:   {new_slug}\n")
                updated_count += 1
            else:
                print(f"ℹSkipping: '{product.name}' (Slug already clean)")

        # Save changes to the database
        db.commit()
        print(f"Successfully updated {updated_count} product slugs!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_slugs()
import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models.product import Product

def generate_clean_slug(name: str, db: Session, current_product_id: int) -> str:
    if not name:
        return f"product-{current_product_id}"

    # Normalize: lower, remove special chars, replace spaces with dashes
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    base_slug = re.sub(r'[\s_-]+', '-', normalized).strip('-')
    
    slug = base_slug
    counter = 1
    
    while True:
        # Optimization: Only check for collisions with OTHER products
        existing = db.query(Product).filter(
            Product.slug == slug, 
            Product.id != current_product_id
        ).first()
        
        if not existing:
            break
        
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    return slug

def migrate_slugs():
    db: Session = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"Found {len(products)} products. Starting migration...")

        updated_count = 0
        for product in products:
            # Explicitly store name to handle None types
            product_name = product.name or f"Product {product.id}"
            new_slug = generate_clean_slug(product_name, db, product.id)
            
            if product.slug != new_slug:
                print(f"Updating: '{product_name}' | {product.slug} -> {new_slug}")
                product.slug = new_slug
                updated_count += 1
        
        db.commit()
        print(f"Success! Updated {updated_count} slugs.")
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_slugs()
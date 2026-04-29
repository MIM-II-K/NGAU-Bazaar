"""
Migration script to fix existing product slugs
Removes product IDs from slugs and ensures all slugs are clean and unique
"""

import re
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models.product import Product

def clean_slug_name(name: str) -> str:
    """Convert product name to a clean slug base"""
    if not name:
        return ""
    
    # Convert to lowercase, remove special chars, replace spaces with hyphens
    cleaned = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[\s_-]+', '-', cleaned).strip('-')
    slug = re.sub(r'-+', '-', slug)  # Remove multiple hyphens
    
    return slug

def extract_clean_slug_from_current(slug: str) -> str:
    """
    Extract a clean slug from existing slug by removing ID suffixes
    Example: "fresh-tomatoes-123" -> "fresh-tomatoes"
    """
    if not slug:
        return ""
    
    # Remove trailing -number patterns (but keep if it's part of the name)
    # Pattern: ends with -digits
    pattern = r'-\d+$'
    clean_slug = re.sub(pattern, '', slug)
    
    # Also remove patterns like -123 at the end
    return clean_slug

def generate_unique_slug(base_slug: str, db: Session, current_id: int, existing_slugs: dict = None) -> str:
    """Generate a unique slug by adding counter if needed"""
    if not base_slug:
        base_slug = f"product-{current_id}"
    
    slug = base_slug
    counter = 1
    
    while True:
        # Check if slug exists for a different product
        if existing_slugs is not None:
            # Use pre-loaded slugs for faster checking
            if slug in existing_slugs and existing_slugs[slug] != current_id:
                slug = f"{base_slug}-{counter}"
                counter += 1
                continue
            else:
                break
        else:
            # Query database
            existing = db.query(Product).filter(
                Product.slug == slug,
                Product.id != current_id
            ).first()
            
            if not existing:
                break
            
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Safety limit
        if counter > 100:
            slug = f"{base_slug}-{current_id}"
            break
    
    return slug

def migrate_slugs():
    """Main migration function to fix all product slugs"""
    db: Session = SessionLocal()
    
    try:
        print("🔍 Fetching all products...")
        products = db.query(Product).all()
        print(f"📦 Found {len(products)} products\n")
        
        # First pass: Build map of existing slugs to detect conflicts
        slug_map = {}
        for product in products:
            if product.slug:
                slug_map[product.slug] = product.id
        
        updated_count = 0
        skipped_count = 0
        errors = []
        
        print("🔄 Processing slugs...\n")
        
        for product in products:
            old_slug = product.slug
            
            # Determine the desired base slug
            if product.name:
                # Generate from product name
                base_slug = clean_slug_name(product.name)
            elif old_slug:
                # Extract from existing slug
                base_slug = extract_clean_slug_from_current(old_slug)
            else:
                # Fallback
                base_slug = f"product-{product.id}"
            
            # Skip if base_slug is empty
            if not base_slug:
                base_slug = f"product-{product.id}"
            
            # Generate unique slug
            new_slug = generate_unique_slug(base_slug, db, product.id, slug_map)
            
            # Update slug_map with new slug
            if new_slug != old_slug:
                # Remove old slug from map if it exists
                if old_slug and old_slug in slug_map:
                    del slug_map[old_slug]
                # Add new slug to map
                slug_map[new_slug] = product.id
                
                # Update product
                product.slug = new_slug
                updated_count += 1
                
                print(f"✅ [{product.id}] {product.name[:50]}")
                print(f"   Old: {old_slug}")
                print(f"   New: {new_slug}\n")
            else:
                skipped_count += 1
                print(f"⏭️  [{product.id}] {product.name[:50]} - alreadyOK: {new_slug}")
        
        # Commit changes
        if updated_count > 0:
            print(f"\n💾 Committing {updated_count} changes to database...")
            db.commit()
            print("✅ Changes committed successfully!")
        else:
            print("\n📝 No changes needed - all slugs are already clean!")
        
        # Verification
        print("\n🔍 Verifying slug uniqueness...")
        verify_products = db.query(Product).all()
        slug_check = {}
        duplicates = []
        
        for product in verify_products:
            if product.slug:
                if product.slug in slug_check:
                    duplicates.append({
                        'slug': product.slug,
                        'ids': [slug_check[product.slug], product.id]
                    })
                else:
                    slug_check[product.slug] = product.id
        
        if duplicates:
            print("\n⚠️  WARNING: Found duplicate slugs:")
            for dup in duplicates:
                print(f"   - '{dup['slug']}' used by products: {dup['ids']}")
        else:
            print("✅ All slugs are unique!")
        
        # Summary
        print("\n" + "="*50)
        print("📊 MIGRATION SUMMARY")
        print("="*50)
        print(f"Total products processed: {len(products)}")
        print(f"Slugs updated: {updated_count}")
        print(f"Slugs unchanged: {skipped_count}")
        if errors:
            print(f"Errors: {len(errors)}")
            for error in errors:
                print(f"  - {error}")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 PRODUCT SLUG MIGRATION TOOL")
    print("="*50)
    print("This will clean up product slugs by:")
    print("  1. Removing any product IDs from slugs")
    print("  2. Generating clean URL-friendly slugs from product names")
    print("  3. Ensuring all slugs are unique")
    print("="*50)
    
    confirm = input("\n⚠️  Make sure you have a database backup before continuing!\n\nContinue? (yes/no): ")
    
    if confirm.lower() == 'yes':
        migrate_slugs()
        print("\n✨ Migration complete! Restart your FastAPI server.")
    else:
        print("\n❌ Migration cancelled.")
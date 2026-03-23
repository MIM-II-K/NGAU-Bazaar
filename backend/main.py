import os
import traceback
import uuid
import shutil
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqladmin import Admin, ModelView
from database import engine, Base, SessionLocal
from utils.flash_deal_cleanup import reset_expired_flash_deals
from fastapi_utils.tasks import repeat_every
from fastapi.responses import JSONResponse

# --- 1. Import Models ---
# Ensure these match the filenames in your /models folder
from models.user import User
from models.product import Product, ProductImage, ProductVariant, Review
from models.category import Category

# --- 2. Import Routers ---
from routers.user import router as user_router
from routers.admin import router as admin_router
from routers.product import router as product_router
from routers.category import router as category_router
from routers.order import router as order_router
from routers.cart import router as cart_router
from routers.payment import router as payment_router
from routers.flash_deals import router as flash_deals_router
from routers.otp import router as otp_router
from routers.set_password import router as set_password_router

# --- 3. Database Initialization ---
# This creates the new tables (ProductImage, ProductVariant, Review) automatically in dev
if os.getenv("ENV") == "development":
    Base.metadata.create_all(bind=engine)

# --- 4. FastAPI App Setup ---
app = FastAPI(
    title="NGAU Bazaar API",
    description="E-commerce API with Phase 1: Multiple Images & Variants support",
    version="2.1.0"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ngau-bazaar.vercel.app",
    "https://ngau-bazaar.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. Global Error Handling ---
@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    print(f"Global Error caught: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "traceback": str(exc)}
    )

# --- 6. Include Routers ---
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(order_router)
app.include_router(cart_router)
app.include_router(payment_router)
app.include_router(flash_deals_router)
app.include_router(otp_router)
app.include_router(set_password_router)

# --- 7. Static Files Setup ---
# Main directory for all uploads
os.makedirs("static/product_images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- 8. SQLAdmin Setup (Fixed for Phase 1) ---
admin = Admin(app, engine)

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.role]
    icon = "fa-solid fa-user"

class CategoryAdmin(ModelView, model=Category):
    column_list = [Category.id, Category.name, Category.parent_id]
    icon = "fa-solid fa-layer-group"

class ProductAdmin(ModelView, model=Product):
    # REMOVED: Product.image_url (as it's now in ProductImage table)
    column_list = [
        Product.id, 
        Product.name, 
        Product.price, 
        Product.stock, 
        Product.is_flash_deal
    ]
    icon = "fa-solid fa-cart-shopping"

class ProductImageAdmin(ModelView, model=ProductImage):
    column_list = [ProductImage.id, ProductImage.product_id, ProductImage.url]
    icon = "fa-solid fa-image"

class ProductVariantAdmin(ModelView, model=ProductVariant):
    column_list = [ProductVariant.id, ProductVariant.product_id, ProductVariant.name, ProductVariant.stock]
    icon = "fa-solid fa-tags"

# Registering views to the admin panel
admin.add_view(UserAdmin)
admin.add_view(CategoryAdmin)
admin.add_view(ProductAdmin)
admin.add_view(ProductImageAdmin)
admin.add_view(ProductVariantAdmin)

# --- 9. Background Tasks & Health Checks ---
@app.get("/")
def root():
    return {
        "message": "Welcome to NGAU Bazaar API",
        "docs": "/docs",
        "version": "2.1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
@repeat_every(seconds=60)
def refresh_expired_flash_deals() -> None:
    db = SessionLocal()
    try:
        count = reset_expired_flash_deals(db)
        if count:
            print(f"[FlashDealCleanup] Reset {count} expired flash deals")
    finally:
        db.close()
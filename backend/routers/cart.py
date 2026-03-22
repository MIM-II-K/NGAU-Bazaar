import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from models.cart import Cart, CartItem
from models.product import Product
from models.order import Order, OrderItem
from database import SessionLocal
from schemas.cart import CartItemCreate, CartResponse, CartCheckoutResponse
from utils.dependencies import get_current_user
from decimal import Decimal
from datetime import datetime, timezone

router = APIRouter(prefix="/cart", tags=["cart"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 Get or create user's cart
def get_or_create_cart(db: Session, user_id: int):
    cart = db.query(Cart).options(joinedload(Cart.items).joinedload(CartItem.product)).filter(Cart.user_id == user_id).first()

    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart

def serialize_cart(cart):
    items = []
    total_items = 0
    total_price = Decimal("0.00")
    now = datetime.now(timezone.utc)

    for item in cart.items:
        product = item.product
        if not product:
            continue

        original_price = Decimal(str(product.price))
        final_price = original_price
        
        expiry = product.deal_expiry
        if expiry and expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if (product.is_flash_deal and
            product.discount_price and
            expiry and
            expiry > now):
            final_price = product.discount_price
        
        is_deal_active = (
            product.is_flash_deal and
            product.discount_price and
            expiry and
            expiry > now
        )
        if is_deal_active:
            final_price = Decimal(str(product.discount_price))
            discount_percentage = int(
                ((original_price - final_price) / original_price) * 100
                )
        else:
            discount_percentage = 0

        
        subtotal = final_price * item.quantity
        # Grabs the first image from the gallery, or None if no images exist
        image_url = item.product.images[0].url.split("/")[-1] if item.product.images else None
        
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product.name,
            "slug": product.slug,
            "quantity": item.quantity,
            "price": float(final_price),
            "original_price": float(original_price),
            "discount_percentage": discount_percentage,
            "image_url": image_url,
            "subtotal": float(subtotal)
        })

        total_items += item.quantity
        total_price += subtotal

    return {
        "id": cart.id,
        "items": items,
        "total_items": total_items,
        "total_price": float(total_price)
    }

@router.get("/", response_model=CartResponse)
def get_my_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images))
        .filter(Cart.user_id == user.id)
        .first()
    )

    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return serialize_cart(cart)



# ---------------- ADD ITEM TO CART ----------------
@router.post("/add", response_model=CartResponse)
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    
    # 1. Properly get or create the cart
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # 2. Check Product existence and stock
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.quantity < item.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.quantity} items in stock")

    # 3. Check if item already in cart
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id, 
        CartItem.product_id == item.product_id
    ).first()

    if cart_item:
        # Check total quantity against stock before adding
        if product.quantity < (cart_item.quantity + item.quantity):
             raise HTTPException(status_code=400, detail="Not enough stock for this total quantity")
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)

    db.commit()

    # 4. RE-FETCH with joinedload so images are included in the response
    # This is the "magic" that fixes your frontend image issue
    final_cart = db.query(Cart).options(
        joinedload(Cart.items)
        .joinedload(CartItem.product)
        .joinedload(Product.images)
    ).filter(Cart.id == cart.id).first()

    return serialize_cart(final_cart)
# ---------------- UPDATE ITEM QUANTITY ----------------
@router.put("/update", response_model=CartResponse)
def update_cart_item(item: CartItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):

    cart = get_or_create_cart(db, user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == item.product_id)
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if item.quantity <= 0:
        # Remove item if quantity <= 0
        db.delete(cart_item)
    else:
        cart_item.quantity = item.quantity

    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)


# ---------------- REMOVE ITEM FROM CART ----------------
@router.delete("/remove/{product_id}", response_model=CartResponse)
def remove_from_cart(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    cart = get_or_create_cart(db, user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)

@router.post("/checkout")
def checkout_cart(data: CartCheckoutResponse, db: Session = Depends(get_db), user=Depends(get_current_user)):

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items)
        .joinedload(CartItem.product))
        .filter(Cart.user_id == user.id)
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    now = datetime.now(timezone.utc)

    try:
        # Create order
        db_order = Order(
            user_id=user.id, 
            status="pending",
            full_name=data.full_name,
            phone=data.phone,
            email=data.email,
            province=data.province,
            district=data.district,
            address=data.address,
            postal_code=data.postal_code,
            notes=data.notes,
            payment_method=data.payment_method,
            is_cart=False
            )
        db.add(db_order)
        db.flush()

        for item in cart.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )

            if not product or product.quantity < item.quantity:
                raise HTTPException(status_code=404, detail=f"Stock error for {product.name if product else 'Unknown Product'}")
            
            final_price = product.price
            expiry = product.deal_expiry
            
            if expiry and expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            
            is_deal_active = (
                product.is_flash_deal and
                product.discount_price and
                expiry and
                expiry > now
            )

            if is_deal_active:
                final_price = product.discount_price
                
            product.quantity -= item.quantity


            order_item = OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=item.quantity,
                price=final_price
            )
            db.add(order_item)

        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        
        db.commit()
        return {
            "message": "Checkout successful",
            "order_id": db_order.id,
            "status": db_order.status
        }

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
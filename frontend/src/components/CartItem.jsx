import React, { useState } from "react";

const CartItem = ({ item, onUpdate, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    if (val >= 0) setQuantity(val);
  };

  const handleUpdate = () => {
    if (quantity > 0) onUpdate(item.product_id, quantity);
    else onRemove(item.product_id);
  };

  return (
    <div className="cart-item">
      <h4>{item.product_name}</h4>
      <p>Price: ${item.price}</p>
      <p>Subtotal: ${item.subtotal}</p>
      <input type="number" value={quantity} min={0} onChange={handleChange} />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={() => onRemove(item.product_id)}>Remove</button>
    </div>
  );
};

export default CartItem;

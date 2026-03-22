import { Modal, Button } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';

const ProductModal = ({ show, onHide, product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      alert(`${product.name} added to cart`);
      onHide(); // close modal after adding
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex flex-column align-items-center">
        <img
          src={product.image_url || '/fallback-image.svg'}
          alt={product.name}
          className="img-fluid mb-3"
          style={{ maxHeight: '300px' }}
        />
        <p>{product.description || 'No description available.'}</p>
        <h5>Rs. {product.price}</h5>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;

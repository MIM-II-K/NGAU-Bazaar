import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "../ProductCard";
import { productApi } from "../../utils/productApi";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await productApi.getAll({
      page: 1,
      limit: 8
    });

    setProducts(response.data || []);
  };

  return (
    <section className="featured-products">
      <div className="section-header">
        <span>FEATURED PRODUCTS</span>
        <h2>Fresh Harvest</h2>
      </div>

      <Row>
        {products.map((product) => (
          <Col md={6} lg={3} key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default FeaturedProducts;
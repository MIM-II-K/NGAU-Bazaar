import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "../ProductCard";

const FeaturedDeals = () => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // replace with deal endpoint
    // productApi.getDeals()
  }, []);

  return (
    <section className="featured-deals">
      <div className="section-header">
        <span>LIMITED OFFERS</span>
        <h2>Today's Deals</h2>
      </div>

      <Row>
        {deals.map((deal) => (
          <Col md={6} lg={3} key={deal.id}>
            <ProductCard product={deal} />
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default FeaturedDeals;
import React from "react";
import { useNavigate } from "react-router-dom";

const HomeCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="home-cta">
      <h2>Ready For Fresher Groceries?</h2>

      <p>
        Join thousands of families shopping local every day.
      </p>

      <button
        onClick={() => navigate("/shop")}
        className="cta-btn"
      >
        Start Shopping
      </button>
    </section>
  );
};

export default HomeCTA;
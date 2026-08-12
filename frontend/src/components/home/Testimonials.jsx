import React from "react";

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="section-header">
        <span>REVIEWS</span>
        <h2>What Customers Say</h2>
      </div>

      <div className="testimonial-grid">
        <div className="testimonial-card">
          ⭐⭐⭐⭐⭐
          <p>
            Fresh vegetables and very fast delivery.
          </p>
          <strong>Ram K.</strong>
        </div>

        <div className="testimonial-card">
          ⭐⭐⭐⭐⭐
          <p>
            Better quality than local supermarkets.
          </p>
          <strong>Sita B.</strong>
        </div>

        <div className="testimonial-card">
          ⭐⭐⭐⭐⭐
          <p>
            Great support for local farmers.
          </p>
          <strong>Hari P.</strong>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import React from "react";

const images = [
  "/gallery/farm1.jpg",
  "/gallery/farm2.jpg",
  "/gallery/farm3.jpg",
  "/gallery/farm4.jpg",
  "/gallery/farm5.jpg",
  "/gallery/farm6.jpg"
];

const FeaturedGallery = () => {
  return (
    <section className="featured-gallery">
      <div className="section-header">
        <span>OUR COMMUNITY</span>
        <h2>Farm To Table Journey</h2>
      </div>

      <div className="gallery-grid">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            className="gallery-image"
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedGallery;
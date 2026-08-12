import React from "react";
import Categories from "../../pages/Categories";

const CategoryGrid = () => {
  return (
    <section className="home-categories">
      <div className="section-header">
        <span>SHOP BY CATEGORY</span>
        <h2>Categories</h2>
      </div>

      <Categories />
    </section>
  );
};

export default CategoryGrid;
import React from "react";
import { Truck, Leaf, Users } from "lucide-react";

const features = [
  {
    icon: <Truck size={40} />,
    title: "Fast Delivery",
    desc: "Same day delivery within your city."
  },
  {
    icon: <Leaf size={40} />,
    title: "Organic Produce",
    desc: "Fresh products directly from farms."
  },
  {
    icon: <Users size={40} />,
    title: "Support Farmers",
    desc: "Most revenue goes directly to producers."
  }
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="section-header">
        <span>WHY US</span>
        <h2>Why Choose Ngau?</h2>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            {feature.icon}
            <h4>{feature.title}</h4>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
import React from 'react';
import '../styles/skeleton.css';

const SkeletonLoader = ({ type = 'text', width, height, borderRadius }) => {
  // Inline styles for custom dimensions if needed
  const style = {
    width: width || (type === 'avatar' ? '50px' : '100%'),
    height: height || (type === 'avatar' ? '50px' : '15px'),
    borderRadius: borderRadius || (type === 'avatar' ? '50%25' : '8px'),
  };

  return (
    <div 
      className={`skeleton-base skeleton-${type}`} 
      style={style}
    >
      <div className="skeleton-shimmer-wrapper">
        <div className="skeleton-shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
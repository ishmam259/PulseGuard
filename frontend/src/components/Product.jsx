import React from 'react'
import './Product.css'

/**
 * Product component for rendering a small thumbnail with text details.
 * Supports horizontal (right) and vertical (bottom) layouts.
 * 
 * @param {string} image - URL of the product image
 * @param {string} title - Product title
 * @param {string} price - Product price string
 * @param {string} description - Optional short description
 * @param {string} layout - 'vertical' (default) or 'horizontal'
 * @param {string} className - Optional extra CSS classes
 */
export default function Product({ 
  image, 
  title, 
  price, 
  description, 
  layout = 'vertical', 
  className = '' 
}) {
  const isHorizontal = layout === 'horizontal'

  return (
    <div className={`product-component ${isHorizontal ? 'product--horizontal' : 'product--vertical'} ${className}`}>
      <div className="product-thumbnail">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="product-info">
        <h4 className="product-title">{title}</h4>
        {description && <p className="product-description">{description}</p>}
        {price && <span className="product-price">{price}</span>}
      </div>
    </div>
  )
}

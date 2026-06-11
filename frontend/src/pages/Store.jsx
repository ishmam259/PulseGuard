import React, { useState, useEffect, useCallback } from 'react'
import MobileLayout from '../components/layout/MobileLayout'
import AdminLayout from '../components/layout/AdminLayout'
import { useApp } from '../context/AppContext'
import { patientNavItems, workerNavItems } from '../data/navItems'
import './Store.css'

/* ── Banner data ── */
const BANNERS = [
  {
    id: 1,
    tag: 'Flash Sale',
    title: 'Prenatal Essentials',
    sub: 'Stock up on vitamins & supplements',
    discount: '30%',
    emoji: '💊',
    gradient: 'linear-gradient(135deg, oklch(0.55 0.22 350) 0%, oklch(0.45 0.18 320) 100%)',
  },
  {
    id: 2,
    tag: 'New Arrivals',
    title: 'Maternity Clothing',
    sub: 'Comfortable styles for every trimester',
    discount: '20%',
    emoji: '👗',
    gradient: 'linear-gradient(135deg, oklch(0.52 0.18 280) 0%, oklch(0.45 0.14 310) 100%)',
  },
  {
    id: 3,
    tag: 'Bundle Deal',
    title: 'Baby Starter Kit',
    sub: 'Everything your newborn needs',
    discount: '25%',
    emoji: '🍼',
    gradient: 'linear-gradient(135deg, oklch(0.50 0.16 200) 0%, oklch(0.44 0.14 240) 100%)',
  },
  {
    id: 4,
    tag: 'Weekly Offer',
    title: 'Mother Care Foods',
    sub: 'Nutrition that keeps you & baby strong',
    discount: '15%',
    emoji: '🥗',
    gradient: 'linear-gradient(135deg, oklch(0.52 0.16 140) 0%, oklch(0.44 0.14 170) 100%)',
  },
]

/* ── Category data ── */
const CATEGORIES = [
  { id: 'clothes',     label: 'Clothes',          icon: '👗' },
  { id: 'baby',        label: 'Baby Products',    icon: '🍼' },
  { id: 'medicines',   label: 'Medicines',        icon: '💊' },
  { id: 'motherfoods', label: 'Mother Care Foods', icon: '🥗' },
]

const PRODUCTS = {
  clothes: [
    { id: 'c1', name: 'Flowy Maternity Dress', desc: 'Breathable cotton, empire waist',     price: '$42.00', oldPrice: '$58.00', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e05?q=80&w=300&auto=format&fit=crop' },
    { id: 'c2', name: 'Nursing Tank Top',      desc: 'Clip-down design for easy feeding',  price: '$24.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=300&auto=format&fit=crop' },
    { id: 'c3', name: 'Bump-Band Jeans',       desc: 'Adjustable panel grows with you',    price: '$55.00', oldPrice: '$70.00', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300&auto=format&fit=crop' },
    { id: 'c4', name: 'Cozy Lounge Set',       desc: 'Soft modal fabric, relaxed fit',     price: '$38.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop' },
    { id: 'c5', name: 'Nursing Bra',           desc: 'Wireless support with easy access',  price: '$29.00', oldPrice: '$35.00', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=300&auto=format&fit=crop' },
    { id: 'c6', name: 'Wrap Cardigan',         desc: 'Versatile layer for any occasion',   price: '$34.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=300&auto=format&fit=crop' },
  ],
  baby: [
    { id: 'b1', name: 'Baby Monitor',          desc: 'HD video, night vision, two-way audio', price: '$129.00', oldPrice: '$160.00', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=300&auto=format&fit=crop' },
    { id: 'b2', name: 'Newborn Diaper Pack',   desc: 'Ultra-soft, 72-count pack',             price: '$22.00', oldPrice: null,      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=300&auto=format&fit=crop' },
    { id: 'b3', name: 'Muslin Swaddle Set',    desc: '4-pack breathable wraps',               price: '$36.00', oldPrice: '$44.00',  image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=300&auto=format&fit=crop' },
    { id: 'b4', name: 'Infant Carrier',        desc: 'Ergonomic, newborn–3 years',            price: '$89.00', oldPrice: '$110.00', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=300&auto=format&fit=crop' },
    { id: 'b5', name: 'Baby Bottle Set',       desc: 'Anti-colic, BPA-free, 3-pack',          price: '$28.00', oldPrice: null,      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=300&auto=format&fit=crop' },
    { id: 'b6', name: 'Crib Mobile',           desc: 'Soothing melodies & rotating shapes',   price: '$45.00', oldPrice: '$55.00',  image: 'https://images.unsplash.com/photo-1566479179817-9a31f87abf03?q=80&w=300&auto=format&fit=crop' },
  ],
  medicines: [
    { id: 'm1', name: 'Prenatal Vitamins',     desc: 'DHA + Iron + Folate, 60 capsules',    price: '$24.99', oldPrice: '$32.00', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop' },
    { id: 'm2', name: 'Iron Supplement',       desc: 'Gentle on stomach, 30 tablets',       price: '$14.99', oldPrice: null,     image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=300&auto=format&fit=crop' },
    { id: 'm3', name: 'Folic Acid 400mcg',     desc: 'Neural tube support, 90 tablets',     price: '$9.99',  oldPrice: '$13.00', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=300&auto=format&fit=crop' },
    { id: 'm4', name: 'Magnesium Complex',     desc: 'Reduces cramps & supports sleep',     price: '$19.99', oldPrice: null,     image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&auto=format&fit=crop' },
    { id: 'm5', name: 'Calcium + Vitamin D3',  desc: 'Bone & teeth health, 60 tablets',     price: '$16.99', oldPrice: '$21.00', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=300&auto=format&fit=crop' },
    { id: 'm6', name: 'Probiotics for Moms',   desc: 'Gut health during & after pregnancy', price: '$27.99', oldPrice: null,     image: 'https://images.unsplash.com/photo-1616362185073-4d43e4bd56dc?q=80&w=300&auto=format&fit=crop' },
  ],
  motherfoods: [
    { id: 'f1', name: 'Nursing Support Tea',   desc: 'Fenugreek & fennel blend, 20 bags',   price: '$12.00', oldPrice: '$15.00', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=300&auto=format&fit=crop' },
    { id: 'f2', name: 'Protein Shake Mix',     desc: 'Whey-free, 20g protein, vanilla',     price: '$38.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=300&auto=format&fit=crop' },
    { id: 'f3', name: 'DHA Omega-3 Oil',       desc: 'Brain & eye development support',     price: '$29.00', oldPrice: '$36.00', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop' },
    { id: 'f4', name: 'Lactation Cookies',     desc: 'Oat & flaxseed, 12-pack',             price: '$18.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop' },
    { id: 'f5', name: 'Collagen Powder',       desc: 'Skin elasticity & joint recovery',    price: '$34.00', oldPrice: '$42.00', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=300&auto=format&fit=crop' },
    { id: 'f6', name: 'Organic Date Syrup',    desc: 'Natural energy, iron-rich',           price: '$10.00', oldPrice: null,     image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=300&auto=format&fit=crop' },
  ],
}

/* ── Sub-components ── */
function Carousel() {
  const [active, setActive] = useState(0)

  const next = useCallback(() => setActive(i => (i + 1) % BANNERS.length), [])
  const prev = useCallback(() => setActive(i => (i - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    const id = setInterval(next, 3500)
    return () => clearInterval(id)
  }, [next])

  return (
    <div className="store-carousel">
      <div
        className="store-carousel__track"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {BANNERS.map(b => (
          <div
            key={b.id}
            className="store-carousel__slide"
            style={{ background: b.gradient }}
          >
            <div className="store-carousel__badge">{b.emoji}</div>
            <div className="store-carousel__text">
              <span className="store-carousel__tag">{b.tag}</span>
              <h3 className="store-carousel__title">{b.title}</h3>
              <p className="store-carousel__sub">{b.sub}</p>
            </div>
            <div className="store-carousel__discount">
              <span className="store-carousel__pct">{b.discount}</span>
              <span className="store-carousel__off">OFF</span>
            </div>
          </div>
        ))}
      </div>

      <button className="store-carousel__arrow store-carousel__arrow--prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="store-carousel__arrow store-carousel__arrow--next" onClick={next} aria-label="Next">›</button>

      <div className="store-carousel__dots">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`store-carousel__dot${i === active ? ' store-carousel__dot--active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ name, desc, price, oldPrice, image }) {
  return (
    <div className="store-product-card">
      <img className="store-product-card__img" src={image} alt={name} loading="lazy" />
      <div className="store-product-card__body">
        <h4 className="store-product-card__name">{name}</h4>
        <p className="store-product-card__desc">{desc}</p>
        <div className="store-product-card__footer">
          <div>
            <span className="store-product-card__price">{price}</span>
            {oldPrice && <span className="store-product-card__old-price"> {oldPrice}</span>}
          </div>
          <button className="store-product-card__add" aria-label={`Add ${name} to cart`}>+</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function Store() {
  const { locale, currentUser, connectivity } = useApp()
  const [activeCategory, setActiveCategory] = useState('clothes')

  const navItems = currentUser?.role === 'worker'
    ? workerNavItems(locale)
    : patientNavItems(locale)

  const title = locale === 'bn' ? 'স্টোর' : 'Store'

  const StoreContent = (
    <div className="animate-fade-in" style={{ padding: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '4px' }}>{title}</h2>
        <p className="muted">
          {locale === 'bn' ? 'আপনার এবং আপনার শিশুর জন্য স্বাস্থ্যকর পছন্দ' : 'Healthy choices for you and your baby'}
        </p>
      </div>

      <Carousel />

      <div className="store-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`store-cat-btn${activeCategory === cat.id ? ' store-cat-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="store-cat-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div key={activeCategory} className="store-products-grid">
        {PRODUCTS[activeCategory].map(p => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  )

  if (currentUser?.role === 'admin') {
    return (
      <AdminLayout title={title}>
        {StoreContent}
      </AdminLayout>
    )
  }

  return (
    <MobileLayout title={title} status={connectivity} navItems={navItems}>
      {StoreContent}
    </MobileLayout>
  )
}

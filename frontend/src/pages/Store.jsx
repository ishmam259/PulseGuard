import React, { useState, useEffect, useCallback } from 'react'
import MobileLayout from '../components/layout/MobileLayout'
import AdminLayout from '../components/layout/AdminLayout'
import { useApp } from '../context/AppContext'
import { patientNavItems, workerNavItems } from '../data/navItems'
import {
  HeartPulse, Shirt, Baby, Leaf, Pill, Star, ArrowRight,
  ShoppingBag, Heart, Sparkles, ChevronRight,
} from 'lucide-react'
import './Store.css'

/* ── Banner data ── */
const BANNERS = [
  {
    id: 1,
    tag: 'Flash Sale',
    title: 'Prenatal Essentials',
    sub: 'Vitamins, supplements & more',
    discount: '30',
    Icon: HeartPulse,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(233,30,140,0.82) 0%, rgba(194,24,91,0.88) 100%)',
  },
  {
    id: 2,
    tag: 'New Arrivals',
    title: 'Maternity Clothing',
    sub: 'Comfortable styles every trimester',
    discount: '20',
    Icon: Shirt,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(216,27,96,0.82) 0%, rgba(173,20,87,0.9) 100%)',
  },
  {
    id: 3,
    tag: 'Bundle Deal',
    title: 'Baby Starter Kit',
    sub: 'Everything your newborn needs',
    discount: '25',
    Icon: Baby,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(240,98,146,0.80) 0%, rgba(233,30,140,0.88) 100%)',
  },
  {
    id: 4,
    tag: 'Weekly Offer',
    title: 'Mother Care Foods',
    sub: 'Nutrition for you & your baby',
    discount: '15',
    Icon: Leaf,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(233,30,140,0.82) 0%, rgba(136,14,79,0.90) 100%)',
  },
]

/* ── Category data ── */
const CATEGORIES = [
  { id: 'clothes',     label: 'Clothes',           Icon: Shirt },
  { id: 'baby',        label: 'Baby Products',     Icon: Baby },
  { id: 'medicines',   label: 'Medicines',         Icon: Pill },
  { id: 'motherfoods', label: 'Mother Care Foods', Icon: Leaf },
]

/* ── Featured stores ── */
const STORES = [
  { id: 's1', name: 'NurtureCare',  tagline: 'Prenatal supplements', rating: 4.8, Icon: Heart,       bg: '#fce4ec' },
  { id: 's2', name: 'BabyBliss',    tagline: 'Baby essentials',       rating: 4.9, Icon: Baby,        bg: '#f3e5f5' },
  { id: 's3', name: 'MomStyle Co.', tagline: 'Maternity fashion',     rating: 4.7, Icon: Shirt,       bg: '#e3f2fd' },
  { id: 's4', name: 'GreenNourish', tagline: 'Foods & nutrition',     rating: 4.6, Icon: Leaf,        bg: '#e8f5e9' },
  { id: 's5', name: 'MedPlus Mama', tagline: 'Vitamins & medicines',  rating: 4.8, Icon: Pill,        bg: '#fff3e0' },
  { id: 's6', name: 'PulseShop',    tagline: 'Curated by PulseGuard', rating: 5.0, Icon: Sparkles,    bg: '#fce4ec' },
]

const PRODUCTS = {
  clothes: [
    { id: 'c1', name: 'Flowy Maternity Dress', desc: 'Breathable cotton, empire waist',     price: '৳4,600', oldPrice: '৳6,400', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300&auto=format&fit=crop' },
    { id: 'c2', name: 'Nursing Tank Top',      desc: 'Clip-down design for easy feeding',  price: '৳2,650', oldPrice: null,     image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=300&auto=format&fit=crop' },
    { id: 'c3', name: 'Bump-Band Jeans',       desc: 'Adjustable panel grows with you',    price: '৳6,050', oldPrice: '৳7,700', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300&auto=format&fit=crop' },
    { id: 'c4', name: 'Cozy Lounge Set',       desc: 'Soft modal fabric, relaxed fit',     price: '৳4,200', oldPrice: null,     image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop' },
    { id: 'c5', name: 'Nursing Bra',           desc: 'Wireless support with easy access',  price: '৳3,200', oldPrice: '৳3,850', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=300&auto=format&fit=crop' },
    { id: 'c6', name: 'Wrap Cardigan',         desc: 'Versatile layer for any occasion',   price: '৳3,750', oldPrice: null,     image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=300&auto=format&fit=crop' },
  ],
  baby: [
    { id: 'b1', name: 'Baby Monitor',          desc: 'HD video, night vision, two-way audio', price: '৳14,200', oldPrice: '৳17,600', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=300&auto=format&fit=crop' },
    { id: 'b2', name: 'Newborn Diaper Pack',   desc: 'Ultra-soft, 72-count pack',             price: '৳2,400', oldPrice: null,      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=300&auto=format&fit=crop' },
    { id: 'b3', name: 'Muslin Swaddle Set',    desc: '4-pack breathable wraps',               price: '৳3,950', oldPrice: '৳4,850',  image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=300&auto=format&fit=crop' },
    { id: 'b4', name: 'Infant Carrier',        desc: 'Ergonomic, newborn–3 years',            price: '৳9,800', oldPrice: '৳12,100', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=300&auto=format&fit=crop' },
    { id: 'b5', name: 'Baby Bottle Set',       desc: 'Anti-colic, BPA-free, 3-pack',          price: '৳3,100', oldPrice: null,      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=300&auto=format&fit=crop' },
    { id: 'b6', name: 'Crib Mobile',           desc: 'Soothing melodies & rotating shapes',   price: '৳4,950', oldPrice: '৳6,050',  image: 'https://images.unsplash.com/photo-1566479179817-9a31f87abf03?q=80&w=300&auto=format&fit=crop' },
  ],
  medicines: [
    { id: 'm1', name: 'Prenatal Vitamins',     desc: 'DHA + Iron + Folate, 60 capsules',    price: '৳2,750', oldPrice: '৳3,500', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop' },
    { id: 'm2', name: 'Iron Supplement',       desc: 'Gentle on stomach, 30 tablets',       price: '৳1,650', oldPrice: null,     image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=300&auto=format&fit=crop' },
    { id: 'm3', name: 'Folic Acid 400mcg',     desc: 'Neural tube support, 90 tablets',     price: '৳1,100', oldPrice: '৳1,450', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=300&auto=format&fit=crop' },
    { id: 'm4', name: 'Magnesium Complex',     desc: 'Reduces cramps & supports sleep',     price: '৳2,200', oldPrice: null,     image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&auto=format&fit=crop' },
    { id: 'm5', name: 'Calcium + Vitamin D3',  desc: 'Bone & teeth health, 60 tablets',     price: '৳1,850', oldPrice: '৳2,300', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=300&auto=format&fit=crop' },
    { id: 'm6', name: 'Probiotics for Moms',   desc: 'Gut health during & after pregnancy', price: '৳3,050', oldPrice: null,     image: 'https://images.unsplash.com/photo-1616362185073-4d43e4bd56dc?q=80&w=300&auto=format&fit=crop' },
  ],
  motherfoods: [
    { id: 'f1', name: 'Nursing Support Tea',   desc: 'Fenugreek & fennel blend, 20 bags',   price: '৳1,300', oldPrice: '৳1,650', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=300&auto=format&fit=crop' },
    { id: 'f2', name: 'Protein Shake Mix',     desc: 'Whey-free, 20g protein, vanilla',     price: '৳4,200', oldPrice: null,     image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=300&auto=format&fit=crop' },
    { id: 'f3', name: 'DHA Omega-3 Oil',       desc: 'Brain & eye development support',     price: '৳3,200', oldPrice: '৳3,950', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop' },
    { id: 'f4', name: 'Lactation Cookies',     desc: 'Oat & flaxseed, 12-pack',             price: '৳2,000', oldPrice: null,     image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop' },
    { id: 'f5', name: 'Collagen Powder',       desc: 'Skin elasticity & joint recovery',    price: '৳3,750', oldPrice: '৳4,600', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=300&auto=format&fit=crop' },
    { id: 'f6', name: 'Organic Date Syrup',    desc: 'Natural energy, iron-rich',           price: '৳1,100', oldPrice: null,     image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=300&auto=format&fit=crop' },
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
        {BANNERS.map(b => {
          const BIcon = b.Icon
          return (
            <div
              key={b.id}
              className="store-carousel__slide"
              style={{ backgroundImage: `${b.overlay}, url(${b.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Icon badge */}
              <div className="store-carousel__icon-badge">
                <BIcon style={{ width: '28px', height: '28px', color: '#fff' }} strokeWidth={1.8} />
              </div>

              {/* Text content */}
              <div className="store-carousel__text">
                <span className="store-carousel__tag">{b.tag}</span>
                <h3 className="store-carousel__title">{b.title}</h3>
                <p className="store-carousel__sub">{b.sub}</p>
                <span className="store-carousel__cta">
                  Shop Now <ArrowRight style={{ width: '11px', height: '11px' }} />
                </span>
              </div>

              {/* Discount badge */}
              <div className="store-carousel__discount-badge">
                <span className="store-carousel__pct">{b.discount}%</span>
                <span className="store-carousel__off">OFF</span>
              </div>
            </div>
          )
        })}
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

function StoreCard({ name, tagline, rating, Icon: SIcon, bg }) {
  return (
    <div className="store-shop-card">
      <div className="store-shop-card__icon" style={{ background: bg }}>
        <SIcon style={{ width: '20px', height: '20px', color: '#e91e8c' }} strokeWidth={1.8} />
      </div>
      <p className="store-shop-card__name">{name}</p>
      <p className="store-shop-card__tag">{tagline}</p>
      <div className="store-shop-card__rating">
        <Star style={{ width: '10px', height: '10px', color: '#f59e0b', fill: '#f59e0b' }} />
        <span>{rating.toFixed(1)}</span>
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
            {oldPrice && <span className="store-product-card__old-price">{oldPrice}</span>}
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

      {/* Featured stores */}
      <div className="store-section-header">
        <span className="store-section-title">
          {locale === 'bn' ? 'বিশেষ দোকান' : 'Featured Stores'}
        </span>
        <button className="store-section-more">
          {locale === 'bn' ? 'সব দেখুন' : 'See all'} <ChevronRight style={{ width: '13px', height: '13px' }} />
        </button>
      </div>
      <div className="store-shops-scroll">
        {STORES.map(s => <StoreCard key={s.id} {...s} />)}
      </div>

      {/* Category tabs */}
      <div className="store-section-header" style={{ marginTop: '8px' }}>
        <span className="store-section-title">
          {locale === 'bn' ? 'পণ্য বিভাগ' : 'Browse Products'}
        </span>
      </div>
      <div className="store-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`store-cat-btn${activeCategory === cat.id ? ' store-cat-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <cat.Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} strokeWidth={2} />
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

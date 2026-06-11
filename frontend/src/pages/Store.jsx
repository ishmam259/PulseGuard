import React from 'react'
import MobileLayout from '../components/layout/MobileLayout'
import AdminLayout from '../components/layout/AdminLayout'
import Product from '../components/Product'
import { useApp } from '../context/AppContext'
import { patientNavItems, workerNavItems } from '../data/navItems'
import $ from '../config/strings'

const DEMO_PRODUCTS = [
  {
    id: 1,
    title: 'Prenatal Vitamins',
    price: '$24.99',
    description: 'Essential vitamins for you and your baby.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Comfort Pillow',
    price: '$39.00',
    description: 'Specialized support for better sleep during pregnancy.',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Baby Monitor',
    price: '$129.00',
    description: 'Stay connected with your little one from any room.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Nursing Kit',
    price: '$45.50',
    description: 'Everything you need for a comfortable nursing experience.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=300&auto=format&fit=crop'
  }
]

export default function Store() {
  const { locale, currentUser, connectivity } = useApp()
  
  const navItems = currentUser?.role === 'worker' 
    ? workerNavItems(locale) 
    : patientNavItems(locale)

  const t = {
    en: {
      title: 'Store',
      subtitle: 'Healthy choices for you and your baby',
      verticalHeading: 'Vertical Layout (Thumbnails)',
      horizontalHeading: 'Horizontal Layout (List View)',
    },
    bn: {
      title: 'স্টোর',
      subtitle: 'আপনার এবং আপনার শিশুর জন্য স্বাস্থ্যকর পছন্দ',
      verticalHeading: 'ভার্টিক্যাল লেআউট (থাম্বনেইল)',
      horizontalHeading: 'হরাইজন্টাল লেআউট (লিস্ট ভিউ)',
    }
  }[locale] || { en: {} }

  const content = locale === 'bn' ? t : { ...t.en, ...t }

  const StoreContent = (
    <div className="animate-fade-in" style={{ padding: '8px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '8px' }}>{content.title}</h2>
        <p className="muted" style={{ fontSize: '16px' }}>{content.subtitle}</p>
      </div>

      {/* Vertical Demo */}
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>
          {content.verticalHeading}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '24px' 
        }}>
          {DEMO_PRODUCTS.map(product => (
            <Product 
              key={`v-${product.id}`}
              {...product}
              layout="vertical"
            />
          ))}
        </div>
      </section>

      {/* Horizontal Demo */}
      <section>
        <h3 style={{ marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>
          {content.horizontalHeading}
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>
          {DEMO_PRODUCTS.map(product => (
            <Product 
              key={`h-${product.id}`}
              {...product}
              layout="horizontal"
            />
          ))}
        </div>
      </section>
    </div>
  )

  if (currentUser?.role === 'admin') {
    return (
      <AdminLayout title={content.title}>
        {StoreContent}
      </AdminLayout>
    )
  }

  return (
    <MobileLayout
      title={content.title}
      status={connectivity}
      navItems={navItems}
    >
      {StoreContent}
    </MobileLayout>
  )
}

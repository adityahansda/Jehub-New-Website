import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  title: "Jharkhand Engineer's Hub - JEHub",
  description: "Join Jharkhand Engineer's Hub (JEHub) - Your gateway to engineering excellence in Jharkhand. Access study materials, notes, internships, events, and connect with fellow engineers.",
  canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com", // Replace with your actual domain
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com', // Replace with your actual domain
    siteName: "Jharkhand Engineer's Hub",
    title: "Jharkhand Engineer's Hub - JEHub",
    description: "Join Jharkhand Engineer's Hub (JEHub) - Your gateway to engineering excellence in Jharkhand. Access study materials, notes, internships, events, and connect with fellow engineers.",
    images: [
      {
        url: '/images/og-image.jpg', // Add your OG image
        width: 1200,
        height: 630,
        alt: "Jharkhand Engineer's Hub"
      }
    ]
  },
  twitter: {
    handle: '@JEHub', // Replace with your Twitter handle
    site: '@JEHub', // Replace with your Twitter handle
    cardType: 'summary_large_image'
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/images/favicon.svg',
      type: 'image/svg+xml'
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/icon-152x152.png',
      sizes: '152x152'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    }
  ],
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    {
      name: 'robots',
      content: 'index,follow'
    },
    {
      name: 'googlebot',
      content: 'index,follow'
    },
    {
      name: 'keywords',
      content: 'engineering, jharkhand, students, notes, study materials, internships, events, technical, education'
    },
    {
      name: 'author',
      content: "Jharkhand Engineer's Hub"
    },
    {
      name: 'theme-color',
      content: '#000000'
    }
  ]
}

export default SEO

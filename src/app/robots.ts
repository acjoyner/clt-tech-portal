import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://clt-tech-portal.vercel.app' // Replace with your URL

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin', // Keeps your internal business data private from search results
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
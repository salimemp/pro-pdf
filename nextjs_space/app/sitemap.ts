
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.getpropdf.com'
  
  // Main pages
  const mainPages = [
    '',
    '/about',
    '/contact',
    '/pricing',
    '/help',
    '/privacy',
    '/terms',
    '/dashboard',
    '/settings',
    '/jobs',
  ]
  
  // Tool pages
  const tools = [
    '/tools/convert',
    '/tools/merge',
    '/tools/split',
    '/tools/compress',
    '/tools/rotate',
    '/tools/watermark',
    '/tools/page-numbers',
    '/tools/organize',
    '/tools/sign',
    '/tools/encrypt',
    '/tools/decrypt',
    '/tools/html-to-pdf',
    '/tools/crop',
    '/tools/edit',
  ]
  
  const mainPagesUrls = mainPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: page === '' ? 1 : 0.8,
  }))
  
  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  return [...mainPagesUrls, ...toolUrls]
}

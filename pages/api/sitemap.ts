import { NextApiRequest, NextApiResponse } from 'next';

function generateSitemap() {
  const baseUrl = 'https://jehub.vercel.app';
  const currentDate = new Date().toISOString();
  
  const pages = [
    // High Priority Pages
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/notes-download', changefreq: 'daily', priority: '1.0' },
    { url: '/about', changefreq: 'daily', priority: '1.0' },
    
    // Medium Priority Pages
    { url: '/team', changefreq: 'weekly', priority: '0.8' },
    { url: '/community-rules', changefreq: 'weekly', priority: '0.8' },
    { url: '/privacy-policy', changefreq: 'weekly', priority: '0.8' },
    { url: '/terms-of-service', changefreq: 'weekly', priority: '0.8' },
    { url: '/beta-wishlist', changefreq: 'weekly', priority: '0.7' },
    { url: '/wishlist-users', changefreq: 'weekly', priority: '0.7' },
    { url: '/ban', changefreq: 'weekly', priority: '0.7' },
    { url: '/ban-user-list', changefreq: 'weekly', priority: '0.7' },
    
    // Lower Priority Pages
    { url: '/referral', changefreq: 'monthly', priority: '0.5' },
    { url: '/verify-membership', changefreq: 'monthly', priority: '0.5' },
    { url: '/telegram-members', changefreq: 'monthly', priority: '0.5' },
    { url: '/user/verify', changefreq: 'monthly', priority: '0.5' },
    { url: '/team/join-team', changefreq: 'monthly', priority: '0.5' },
    { url: '/team/old-team-members', changefreq: 'monthly', priority: '0.5' }
  ];

  const urlset = pages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}
</urlset>`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set proper headers for XML content
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  
  // Generate and return the sitemap
  const sitemap = generateSitemap();
  res.status(200).send(sitemap);
}

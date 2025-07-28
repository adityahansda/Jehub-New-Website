import { NextApiRequest, NextApiResponse } from 'next';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Function to recursively scan pages directory
function scanPagesDirectory(dir: string, baseDir: string = ''): string[] {
  const pages: string[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = join(baseDir, item);
      
      if (statSync(fullPath).isDirectory()) {
        // Skip certain directories
        if (!['api', '_app', '_document'].includes(item)) {
          pages.push(...scanPagesDirectory(fullPath, relativePath));
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        // Convert file path to route path
        let routePath = relativePath
          .replace(/\.(tsx|ts)$/, '') // Remove extension
          .replace(/\\/g, '/'); // Convert Windows paths to URL paths
        
        // Handle special cases
        if (routePath === 'index') {
          routePath = '/';
        } else if (routePath.endsWith('/index')) {
          routePath = routePath.replace('/index', '') || '/';
        } else {
          routePath = '/' + routePath;
        }
        
        // Skip certain pages
        const skipPages = [
          '/_app',
          '/_document',
          '/404',
          '/500'
        ];
        
        if (!skipPages.includes(routePath) && !routePath.startsWith('/api/')) {
          pages.push(routePath);
        }
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', dir, error);
  }
  
  return pages;
}

// Static pages that might not be in the pages directory
const staticRoutes = [
  '/',
  '/about',
  '/blog',
  '/events',
  '/exam-updates',
  '/counselling-updates',
  '/internships',
  '/groups',
  '/leaderboard',
  '/wishlist',
  '/notes/download',
  '/notes/upload',
  '/notes/request',
  '/team',
  '/join-team',
  '/login',
  '/signup',
  '/profile',
  '/settings',
  '/notifications'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const pagesDir = join(process.cwd(), 'pages');
    const scannedPages = scanPagesDirectory(pagesDir);
    
    // Combine static routes with scanned pages and remove duplicates
    const allPages = Array.from(new Set([...staticRoutes, ...scannedPages]));
    
    // Categorize pages
    const categorizedPages = allPages.map(page => {
      let category = 'Other';
      let priority = 0.5;
      let changefreq = 'monthly';
      
      // Categorize based on path
      if (page === '/') {
        category = 'Home';
        priority = 1.0;
        changefreq = 'daily';
      } else if (['/about', '/events', '/blog'].includes(page)) {
        category = 'Main Pages';
        priority = 0.9;
        changefreq = 'weekly';
      } else if (page.startsWith('/notes/')) {
        category = 'Notes';
        priority = 0.8;
        changefreq = 'weekly';
      } else if (page.startsWith('/admin/')) {
        category = 'Admin';
        priority = 0.1;
        changefreq = 'monthly';
      } else if (page.startsWith('/auth/') || ['/login', '/signup'].includes(page)) {
        category = 'Authentication';
        priority = 0.3;
        changefreq = 'monthly';
      } else if (page.startsWith('/user/') || ['/profile', '/settings'].includes(page)) {
        category = 'User Pages';
        priority = 0.4;
        changefreq = 'weekly';
      } else if (['/team', '/join-team', '/leaderboard'].includes(page)) {
        category = 'Community';
        priority = 0.7;
        changefreq = 'weekly';
      } else if (['/internships', '/groups', '/wishlist'].includes(page)) {
        category = 'Features';
        priority = 0.6;
        changefreq = 'weekly';
      }
      
      return {
        path: page,
        category,
        defaultPriority: priority,
        defaultChangefreq: changefreq,
        shouldIndex: !page.startsWith('/admin/') && !page.startsWith('/api/') && page !== '/test'
      };
    });
    
    // Sort by category and then by path
    categorizedPages.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.path.localeCompare(b.path);
    });
    
    res.status(200).json({
      success: true,
      data: categorizedPages,
      totalPages: categorizedPages.length
    });
    
  } catch (error) {
    console.error('Error scanning pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan pages'
    });
  }
}

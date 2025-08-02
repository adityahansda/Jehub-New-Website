/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://jehub.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/test/*',
    '/_*',
    '/404',
    '/500',
    '/dashboard*',
    '/admin-dashboard*',
    '/auth/*',
    '/login',
    '/signup',
    '/settings*',
    '/notifications*',
    '/notes-upload*',
    '/notes-request*',
    '/notes/upload*',
    '/notes/request*',
    '/features/*',
    '/misc/*',
    '/pageindex*',
    '/groups*',
    '/internships*',
    '/events*',
    '/blog*',
    '/leaderboard*',
    '/wishlist*',
    '/join-team*',
    '/counselling-updates*',
    '/exam-updates*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/test/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/admin-dashboard/',
          '/auth/',
          '/login',
          '/signup',
          '/settings/',
          '/notifications/',
          '/notes-upload/',
          '/notes-request/',
          '/notes/upload/',
          '/notes/request/',
          '/features/',
          '/misc/',
          '/pageindex/',
          '/groups/',
          '/internships/',
          '/events/',
          '/blog/',
          '/leaderboard/',
          '/wishlist/',
          '/join-team/',
          '/counselling-updates/',
          '/exam-updates/'
        ]
      }
    ],
    additionalSitemaps: [
      'https://jehub.vercel.app/sitemap.xml',
    ]
  },
  additionalPaths: async (config) => {
    // Skip API calls during build time if server is not running
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.VERCEL_URL) {
      return [];
    }
    
    try {
      const res = await fetch(`${config.siteUrl}/api/admin/page-indexing`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        return [];
      }
      
      const { data: pages } = await res.json();
      
      // Use indexing settings to generate sitemap paths
      return pages.filter(page => page.isIndexed).map(page => {
        return {
          loc: page.pagePath,
          changefreq: page.changefreq,
          priority: page.priority,
          lastmod: page.lastmod
        };
      });
    } catch (error) {
      // Silently return empty array during build
      return [];
    }
  },
  transform: async (config, path) => {
    // Skip API calls during build time if server is not running
    if (!(process.env.NODE_ENV === 'production' && (process.env.VERCEL || process.env.VERCEL_URL))) {
      // Use fallback settings during build
    } else {
      // Try to get settings from database first in production
      try {
        const res = await fetch(`${config.siteUrl}/api/admin/page-indexing`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const { data: pages } = await res.json();
          const pageSettings = pages.find(page => page.pagePath === path);
          
          if (pageSettings) {
            return {
              loc: path,
              changefreq: pageSettings.changefreq,
              priority: pageSettings.priority,
              lastmod: pageSettings.lastmod || new Date().toISOString(),
            };
          }
        }
      } catch (error) {
        // Silently fall through to default settings
      }
    }
    
    // Fallback to default settings
    const customConfig = {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }

    // High priority pages
    if (
      path === '/' ||
      path === '/notes/download' ||
      path === '/about' ||
      path === '/events'
    ) {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    }

    // Medium priority pages
    if (
      path.startsWith('/notes/preview/') ||
      path === '/blog' ||
      path === '/internships'
    ) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    }

    // Lower priority pages
    if (
      path === '/login' ||
      path === '/signup' ||
      path.startsWith('/user/')
    ) {
      customConfig.priority = 0.5
      customConfig.changefreq = 'monthly'
    }

    return customConfig
  }
}

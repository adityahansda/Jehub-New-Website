/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://jehub.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
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
          '/join-team/',
          '/counselling-updates/',
          '/exam-updates/'
        ]
      }
    ],
    additionalSitemaps: [
      'https://jehub.vercel.app/api/sitemap',
    ]
  },
  // Simplified transform function without external API calls
  transform: async (config, path) => {
    // Default configuration
    const customConfig = {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }

    // High priority pages
    if (
      path === '/' ||
      path === '/notes-download' ||
      path === '/about'
    ) {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    }

    // Medium priority pages
    if (
      path.startsWith('/notes/preview/') ||
      path === '/team' ||
      path === '/community-rules' ||
      path === '/privacy-policy' ||
      path === '/terms-of-service'
    ) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    }

    // Lower priority pages
    if (
      path.startsWith('/user/') ||
      path === '/referral' ||
      path === '/verify-membership'
    ) {
      customConfig.priority = 0.5
      customConfig.changefreq = 'monthly'
    }

    return customConfig
  }
}

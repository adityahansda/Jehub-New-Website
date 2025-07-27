/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-domain.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/test/*',
    '/_*',
    '/404',
    '/500'
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
          '/private/'
        ]
      }
    ],
    additionalSitemaps: [
      'https://your-domain.com/sitemap.xml',
    ]
  },
  additionalPaths: async (config) => {
    const result = []
    
    // Add dynamic routes for notes
    // You can fetch your notes here and add them to the sitemap
    try {
      // This would be your API call to get all notes
      // const notes = await fetch('your-api-endpoint/notes')
      // notes.forEach(note => {
      //   result.push({
      //     url: `/notes/preview/${note.id}`,
      //     changefreq: 'weekly',
      //     priority: 0.8,
      //     lastmod: note.updatedDate || note.uploadDate
      //   })
      // })
    } catch (error) {
      console.warn('Could not generate dynamic sitemap entries:', error)
    }
    
    return result
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
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

import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../src/index.css'
import Layout from '../src/components/Layout'
import { NavigationProvider } from '../src/contexts/NavigationContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { useRouter } from 'next/router'
import { DefaultSeo } from 'next-seo'
import SEO from '../next-seo.config'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Check if coming soon mode is enabled
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Don't wrap with Layout if we're in coming soon mode and on the home page,
  // or if we're directly accessing the coming-soon page, dashboard page, or admin pages
  const shouldUseLayout = !(isComingSoonMode && router.pathname === '/') && 
                         router.pathname !== '/coming-soon' && 
                         router.pathname !== '/dashboard' &&
                         !router.pathname.startsWith('/admin')
  
  return (
    <>
      <Head>
        {/* Security Meta Tags */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <meta name="application-name" content="JEHUB - Jharkhand Engineer's Hub" />
        <meta name="apple-mobile-web-app-title" content="JEHUB" />
        <meta name="author" content="JEHUB Team" />
        <meta name="publisher" content="JEHUB - Jharkhand Engineer's Hub" />
        <meta name="classification" content="Education" />
        <meta name="category" content="Education, Engineering, Notes" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Prevent credential harvesting false positives */}
        <meta name="password-manager-ignore" content="false" />
        <meta name="credential-type" content="oauth" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* DNS Prefetch for trusted domains */}
        <link rel="dns-prefetch" href="//accounts.google.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </Head>
      
      <ThemeProvider>
        <AuthProvider>
          <NavigationProvider>
            <DefaultSeo {...SEO} />
            {shouldUseLayout ? (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
          </NavigationProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

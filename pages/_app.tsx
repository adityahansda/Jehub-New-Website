import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../src/index.css'
import Layout from '../src/components/Layout'
import { NavigationProvider } from '../src/contexts/NavigationContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { BanProvider } from '../src/contexts/BanContext'
import { useRouter } from 'next/router'
import { DefaultSeo } from 'next-seo'
import SEO from '../next-seo.config'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../src/contexts/AuthContext'

// Inner App component that can access auth context
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Check if coming soon mode is enabled
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'

  // Check if user is on home page and authenticated (would see dashboard)
  const isAuthenticatedHomePage = router.pathname === '/' && user && !isComingSoonMode

  // Don't wrap with Layout if:
  // - Coming soon mode and on home page
  // - Authenticated user on home page (sees dashboard)
  // - Dashboard pages
  // - Admin pages
  // - Special pages
  const shouldUseLayout = !(isComingSoonMode && router.pathname === '/') &&
    !isAuthenticatedHomePage &&
    router.pathname !== '/coming-soon' &&
    router.pathname !== '/dashboard' &&
    router.pathname !== '/dashboard-demo' &&
    router.pathname !== '/NoteHubStyleNotesDownload' &&
    router.pathname !== '/notes-download' &&
    !router.pathname.startsWith('/admin')

  return (
    <>
      <DefaultSeo {...SEO} />
      <ToastContainer />
      {shouldUseLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  )
}

export default function App(appProps: AppProps) {
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
        <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />

        {/* DNS Prefetch for trusted domains */}
        <link rel="dns-prefetch" href="//accounts.google.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </Head>

      <ThemeProvider>
        <AuthProvider>
          <BanProvider>
            <NavigationProvider>
              <AppContent {...appProps} />
            </NavigationProvider>
          </BanProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

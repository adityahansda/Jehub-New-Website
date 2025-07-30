import type { AppProps } from 'next/app'
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
  // or if we're directly accessing the coming-soon page, or on profile page
  const shouldUseLayout = !(isComingSoonMode && router.pathname === '/') && 
                         router.pathname !== '/coming-soon' && 
                         router.pathname !== '/dashboard'
  
  return (
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
  )
}

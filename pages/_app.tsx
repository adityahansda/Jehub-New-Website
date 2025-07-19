import type { AppProps } from 'next/app'
import '../src/index.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import Layout from '../src/components/Layout'
import { AuthProvider } from '../src/contexts/AuthContext'
import { NavigationProvider } from '../src/contexts/NavigationContext'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Check if coming soon mode is enabled
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Don't wrap with Layout if we're in coming soon mode and on the home page,
  // or if we're directly accessing the coming-soon page
  const shouldUseLayout = !(isComingSoonMode && router.pathname === '/') && router.pathname !== '/coming-soon'
  
  return (
    <NavigationProvider>
      <AuthProvider>
        {shouldUseLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthProvider>
    </NavigationProvider>
  )
}

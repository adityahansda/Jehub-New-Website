import type { AppProps } from 'next/app'
import '../src/index.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import Layout from '../src/components/Layout'
import { AuthProvider } from '../src/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  )
}

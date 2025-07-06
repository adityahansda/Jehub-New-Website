import type { AppProps } from 'next/app'
import '../src/index.css'
import Layout from '../src/components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

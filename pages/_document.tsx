import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en-IN">
        <Head>
          {/* Preload critical resources - using Google Fonts instead */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* DNS prefetch for external resources */}
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//www.google-analytics.com" />

          {/* Favicon and app icons */}
          <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />

          {/* Web app manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Theme color for mobile browsers */}
          <meta name="theme-color" content="#ffffff" />
          <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
          <meta name="msapplication-TileColor" content="#1f2937" />

          {/* Google Site Verification */}
          <meta name="google-site-verification" content="zuwUKuvPsoZRnJPKdK3kpBi_R8RTaV29D5ezuDcKbcI" />

          {/* Security headers - Note: X-Frame-Options should be set via HTTP headers, not meta tags */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

          {/* Google Analytics - Using G-7ZWQNF3BVC */}
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=G-7ZWQNF3BVC`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-7ZWQNF3BVC', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext } from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta charSet="UTF-8" />
                    <meta name="description" content="JEHUB is a student-focused ed-tech platform that centralizes notes, discussions, and tools for diploma and BTech students." />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                    {/* ❌ Removed <title> tag */}
                    
                    {/* Google tag (gtag.js) */}
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7ZWQNF3BVC"></script>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', 'G-7ZWQNF3BVC');
                            `
                        }}
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;

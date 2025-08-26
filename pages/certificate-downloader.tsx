import { NextSeo } from 'next-seo';
import CertificateDownloader from '../src/pages/CertificateDownloader';

export default function CertificateDownloaderPage() {
  return (
    <>
      <NextSeo
        title="Certificate Downloader - JEHUB | Download Your Internship Documents"
        description="Download your internship certificates, offer letters, and NDAs from Jharkhand Engineer's Hub. Enter your Intern ID to access and download all your documents in one place."
        canonical="https://www.jehub.co.in/certificate-downloader"
        openGraph={{
          title: "Certificate Downloader - JEHUB | Download Your Internship Documents",
          description: "Download your internship certificates, offer letters, and NDAs from Jharkhand Engineer's Hub. Enter your Intern ID to access and download all your documents in one place.",
          url: "https://www.jehub.co.in/certificate-downloader",
          type: 'website',
          images: [
            {
              url: '/images/certificate-downloader-og.jpg',
              width: 1200,
              height: 630,
              alt: 'JEHUB Certificate Downloader',
            },
          ],
        }}
        twitter={{
          handle: '@jehubofficial',
          site: '@jehubofficial',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'certificate downloader, internship documents, JEHUB, Jharkhand Engineers Hub, document download, offer letter download, NDA download, certificate download, bulk download'
          },
          {
            name: 'author',
            content: 'JEHUB - Jharkhand Engineer\'s Hub'
          },
          {
            name: 'robots',
            content: 'index, follow'
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0'
          }
        ]}
      />
      <CertificateDownloader />
    </>
  );
}

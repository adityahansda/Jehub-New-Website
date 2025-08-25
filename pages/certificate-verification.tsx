import { NextSeo } from 'next-seo';
import CertificateVerification from '../src/pages/CertificateVerification';

export default function CertificateVerificationPage() {
  return (
    <>
      <NextSeo
        title="Certificate Verification - JEHUB | Verify Your Internship Certificate"
        description="Verify the authenticity of your internship certificate issued by Jharkhand Engineer's Hub. Enter your Team ID to validate your certificate and download related documents."
        canonical="https://www.jehub.co.in/certificate-verification"
        openGraph={{
          title: "Certificate Verification - JEHUB | Verify Your Internship Certificate",
          description: "Verify the authenticity of your internship certificate issued by Jharkhand Engineer's Hub. Enter your Team ID to validate your certificate and download related documents.",
          url: "https://www.jehub.co.in/certificate-verification",
          type: 'website',
          images: [
            {
              url: '/images/certificate-verification-og.jpg',
              width: 1200,
              height: 630,
              alt: 'JEHUB Certificate Verification',
            },
          ],
        }}
        twitter={{
          card: 'summary_large_image',
          title: "Certificate Verification - JEHUB",
          description: "Verify the authenticity of your internship certificate issued by Jharkhand Engineer's Hub.",
          images: ['/images/certificate-verification-og.jpg'],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'certificate verification, internship certificate, JEHUB, Jharkhand Engineers Hub, document verification, team ID verification, authentic certificate'
          },
          {
            name: 'author',
            content: 'JEHUB - Jharkhand Engineer\'s Hub'
          },
        ]}
      />
      <CertificateVerification />
    </>
  );
}

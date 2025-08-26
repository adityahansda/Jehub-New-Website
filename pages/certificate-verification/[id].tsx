import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import CertificateVerification from '../../src/pages/CertificateVerification';

interface Props {
  internId: string;
}

export default function DynamicCertificateVerificationPage({ internId }: Props) {
  return (
    <>
      <NextSeo
        title={`Certificate Verification - ${internId} | JEHUB`}
        description={`Verify the authenticity of internship certificate ${internId} issued by Jharkhand Engineer's Hub.`}
        canonical={`https://www.jehub.co.in/certificate-verification/${internId}`}
        openGraph={{
          title: `Certificate Verification - ${internId} | JEHUB`,
          description: `Verify the authenticity of internship certificate ${internId} issued by Jharkhand Engineer's Hub.`,
          url: `https://www.jehub.co.in/certificate-verification/${internId}`,
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
          handle: '@jehubofficial',
          site: '@jehubofficial',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: `certificate verification, ${internId}, internship certificate, JEHUB, Jharkhand Engineers Hub, document verification`
          },
          {
            name: 'author',
            content: 'JEHUB - Jharkhand Engineer\'s Hub'
          },
        ]}
      />
      <CertificateVerification prefillInternId={internId} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  // Validate intern ID format (basic validation)
  if (typeof id !== 'string' || !id.match(/^[A-Z]{2}-[A-Z]{2,3}-\d{3}$/)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      internId: id,
    },
  };
};

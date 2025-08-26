import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import CertificateDownloader from '../../src/pages/CertificateDownloader';

interface Props {
  internId: string;
}

export default function DynamicCertificateDownloaderPage({ internId }: Props) {
  return (
    <>
      <NextSeo
        title={`Certificate Downloader - ${internId} | JEHUB`}
        description={`Download internship documents for ${internId} from Jharkhand Engineer's Hub.`}
        canonical={`https://www.jehub.co.in/certificate-downloader/${internId}`}
        openGraph={{
          title: `Certificate Downloader - ${internId} | JEHUB`,
          description: `Download internship documents for ${internId} from Jharkhand Engineer's Hub.`,
          url: `https://www.jehub.co.in/certificate-downloader/${internId}`,
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
            content: `certificate downloader, ${internId}, internship documents, JEHUB, Jharkhand Engineers Hub, document download`
          },
          {
            name: 'author',
            content: 'JEHUB - Jharkhand Engineer\'s Hub'
          },
        ]}
      />
      <CertificateDownloader prefillInternId={internId} />
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

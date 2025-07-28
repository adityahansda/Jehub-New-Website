import { NextSeo, NextSeoProps } from 'next-seo'
import { useRouter } from 'next/router'

interface SEOProps extends NextSeoProps {
  title?: string
  description?: string
  image?: string
  article?: boolean
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  article = false,
  publishedTime,
  modifiedTime,
  tags,
  ...rest
}) => {
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  const currentUrl = `${baseUrl}${router.asPath}`

  return (
    <NextSeo
      title={title}
      description={description}
      canonical={currentUrl}
      openGraph={{
        type: article ? 'article' : 'website',
        url: currentUrl,
        title,
        description,
        images: image
          ? [
              {
                url: image.startsWith('http') ? image : `${baseUrl}${image}`,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : undefined,
        article: article
          ? {
              publishedTime,
              modifiedTime,
              tags,
            }
          : undefined,
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
      additionalMetaTags={[
        {
          name: 'keywords',
          content: tags?.join(', ') || 'engineering, jharkhand, students, education',
        },
      ]}
      {...rest}
    />
  )
}

export default SEO

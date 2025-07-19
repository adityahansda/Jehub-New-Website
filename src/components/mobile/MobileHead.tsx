import Head from 'next/head';
import React from 'react';

interface MobileHeadProps {
  title?: string;
  description?: string;
}

const MobileHead: React.FC<MobileHeadProps> = ({ 
  title = "JEHUB - Centralized Academic Resources for Students",
  description = "JEHUB is a student-focused ed-tech platform providing notes, tools, and discussions for diploma and BTech students."
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="JEHUB" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Touch Icons */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Performance */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* SEO */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://jehub.com" />
      <meta property="og:image" content="/og-image.jpg" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/og-image.jpg" />
    </Head>
  );
};

export default MobileHead;

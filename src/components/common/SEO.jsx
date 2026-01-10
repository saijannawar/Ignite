import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url, type = 'website' }) {
  // 1. Default fallback values (Edit these to match your brand!)
  const siteTitle = "Ignite Insights | Tech & Projects";
  const defaultDescription = "Shop top-quality robotics components, IoT kits, and engineering project guides at Ignite Insights. Free shipping for VIT Pune students.";
  const defaultImage = "https://ignitenow.tech/og-image.jpg"; // Put a real image URL here later
  const siteUrl = "https://ignitenow.tech";

  // 2. Logic: Use the prop if passed, otherwise use default
  const metaTitle = title ? `${title} | Ignite Insights` : siteTitle;
  const metaDesc = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* --- Standard Metadata --- */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={metaUrl} />

      {/* --- Facebook / Open Graph (For sharing links) --- */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content="Ignite Insights" />

      {/* --- Twitter Cards --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
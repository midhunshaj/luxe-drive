import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, author = 'Midhun Shaj' }) => {
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title ? `${title} | LuxeDrive` : 'LuxeDrive | Premium Vehicle Rentals'}</title>
      <meta name="description" content={description || 'Experience unparalleled luxury with LuxeDrive. The world\'s finest collection of performance and prestige vehicles.'} />
      <meta name="keywords" content={keywords || 'luxury car rental, premium vehicles, exotic cars, sports cars, LuxeDrive, Midhun Shaj'} />
      <meta name="author" content={author} />

      {/* Social Media (Open Graph) */}
      <meta property="og:title" content={title || 'LuxeDrive | Premium Vehicle Rentals'} />
      <meta property="og:description" content={description || 'Experience unparalleled luxury with LuxeDrive.'} />
    </Helmet>
  );
};

export default SEO;

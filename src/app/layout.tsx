import { Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';
import { Metadata } from 'next';
import Script from 'next/script';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://deephealthlab.com'), // Replace with actual domain
  title: {
    default: 'DeepHealth Research Lab | Next-Gen Medical AI',
    template: '%s | DeepHealth Research Lab',
  },
  description: 'DeepHealth Research Lab accelerates healthcare discovery through advanced machine learning models, decoding biological data for earlier diagnosis and personalized treatment.',
  keywords: ['Medical AI', 'Healthcare Discovery', 'Machine Learning', 'Bioinformatics', 'Deep Learning', 'Personalized Medicine', 'Genomics'],
  authors: [{ name: 'DeepHealth Research Lab' }],
  creator: 'DeepHealth Research Lab',
  publisher: 'DeepHealth Research Lab',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://deephealthlab.com',
    title: 'DeepHealth Research Lab | Next-Gen Medical AI',
    description: 'Accelerating healthcare discovery with advanced AI. We decode complex biological data for earlier diagnosis and personalized treatment pathways.',
    siteName: 'DeepHealth Research Lab',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: 'DeepHealth Research Lab Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepHealth Research Lab | Next-Gen Medical AI',
    description: 'Building advanced ML models to accelerate healthcare discovery and personalized medicine.',
    creator: '@deephealthlab', // Replace with actual handle
    images: ['/twitter-image.jpg'], // Ensure this image exists
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DeepHealth Research Lab',
    url: 'https://deephealthlab.com',
    logo: 'https://deephealthlab.com/logo.png',
    sameAs: [
      'https://twitter.com/deephealthlab',
      'https://linkedin.com/company/deephealth-research-lab',
      'https://github.com/deephealth-research-lab',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123-456',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: 'en',
    },
    description: 'DeepHealth Research Lab builds advanced machine learning models to decode complex biological data.',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.className} suppressHydrationWarning>
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

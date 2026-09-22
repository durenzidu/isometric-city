import type { Metadata } from 'next';
import { getLocale } from 'gt-next/server';

const zhMetadata: Metadata = {
  metadataBase: new URL('https://powpowcity.powpow.online'),
  title: {
    default: '泡泡游乐场 — PowPow 过山车公园',
    template: '泡泡游乐场 — %s',
    absolute: '泡泡游乐场 — PowPow 过山车公园',
  },
  description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
  openGraph: {
    title: '泡泡游乐场 — PowPow 过山车公园',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    type: 'website',
    siteName: 'PowPow Park',
    images: [
      {
        url: '/coaster/opengraph-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'PowPow Park - Theme park builder game screenshot'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '泡泡游乐场 — PowPow 过山车公园',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    images: ['/coaster/opengraph-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '泡泡游乐场',
  },
};

const enMetadata: Metadata = {
  metadataBase: new URL('https://powpowcity.powpow.online'),
  title: {
    default: 'PowPow Park — Theme Park Builder',
    template: 'PowPow Park — %s',
    absolute: 'PowPow Park — Theme Park Builder',
  },
  description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
  openGraph: {
    title: 'PowPow Park — Theme Park Builder',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    type: 'website',
    siteName: 'PowPow Park',
    images: [
      {
        url: '/coaster/opengraph-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'PowPow Park - Theme park builder game screenshot'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PowPow Park — Theme Park Builder',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    images: ['/coaster/opengraph-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PowPow Park',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'zh' ? zhMetadata : enMetadata;
}

export default function CoasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

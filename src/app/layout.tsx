import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { getLocale } from "gt-next/server";
import { GTProvider } from "gt-next";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://powpowcity.powpow.online'),
  title: {
    default: '泡泡城市 — PowPow 城市建造',
    template: '%s — 泡泡城市',
  },
  description: '泡泡城市：PowPow 出品的等距视角城市建造游戏。规划住宅、商业与工业区，铺设道路、电网与水管，看你的大都市拔地而起。A richly detailed isometric city builder by PowPow.',
  openGraph: {
    title: '泡泡城市 — PowPow 城市建造',
    description: '规划区域、铺设道路与水电，建造属于你的大都市。A richly detailed isometric city builder by PowPow.',
    type: 'website',
    siteName: '泡泡城市',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: '泡泡城市 - PowPow 等距视角城市建造游戏'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '泡泡城市'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f1219'
};

export default async function RootLayout({ children }: {children: React.ReactNode;}) {
  return (
  <html className={`dark ${playfair.variable} ${dmSans.variable}`} lang={await getLocale()}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Preload critical game assets - WebP for browsers that support it */}
        <link
        rel="preload"
        href="/assets/sprites_red_water_new.webp"
        as="image"
        type="image/webp" />

        <link
        rel="preload"
        href="/assets/water.webp"
        as="image"
        type="image/webp" />

      </head>
      <body className="bg-background text-foreground antialiased font-sans overflow-hidden"><GTProvider>{children}<Analytics /></GTProvider></body>
    </html>
  );
}
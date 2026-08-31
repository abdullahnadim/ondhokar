import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import { ThemeProvider } from './providers';
import './globals.css';

// 1. Premium English Typography
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 2. Premium Bengali Typography
const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#18181b', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ondhokar.vercel.app'),
  title: 'Ondhokar | DESCO Schedule',
  description: 'Check your scheduled DESCO load-shedding hours instantly. A fast, minimal tracker for Dhaka electricity schedules.',
  keywords: ['DESCO', 'Load Shedding', 'Dhaka', 'Electricity Schedule', 'Ondhokar', 'Power Outage', 'Bangladesh'],
  authors: [{ name: 'Abdullah Nadim' }],
  manifest: '/manifest.json', 
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ondhokar',
  },
  openGraph: {
    title: 'Ondhokar | DESCO Schedule',
    description: 'Check your scheduled DESCO load-shedding hours instantly in Dhaka.',
    url: 'https://ondhokar.vercel.app', 
    siteName: 'Ondhokar',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ondhokar - DESCO Load Shedding Schedule Viewer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ondhokar | DESCO Schedule',
    description: 'Check your scheduled DESCO load-shedding hours instantly in Dhaka.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply both font variables to the HTML tag
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${notoBengali.variable}`}>
      <body className="antialiased font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#18181b', // This makes the mobile status bar match your dark theme
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Ondhokar | DESCO Schedule',
  description: 'Check your scheduled DESCO load-shedding hours instantly. A fast, minimal tracker for Dhaka electricity schedules.',
  keywords: ['DESCO', 'Load Shedding', 'Dhaka', 'Electricity Schedule', 'Ondhokar', 'Power Outage', 'Bangladesh'],
  authors: [{ name: 'Abdullah Nadim' }],
  manifest: '/manifest.json', // Links the PWA manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ondhokar',
  },
  openGraph: {
    title: 'Ondhokar | DESCO Schedule',
    description: 'Check your scheduled DESCO load-shedding hours instantly in Dhaka.',
    url: 'https://ondhokar.vercel.app', // Update this to your custom domain later if needed
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
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${inter.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
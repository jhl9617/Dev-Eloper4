import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'highlight.js/styles/github.css';
import Providers from './providers';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Toaster } from '@/components/ui/toaster';
import { WebVitals } from '@/components/web-vitals';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'DevBlog - Modern Blog Platform',
    template: '%s | DevBlog',
  },
  description: 'A modern blog platform built with Next.js and Supabase. Discover programming insights, tutorials, and technical articles.',
  keywords: ['blog', 'nextjs', 'supabase', 'typescript', 'programming', 'web development', 'react', 'tutorials'],
  authors: [{ name: 'DevBlog' }],
  creator: 'DevBlog',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'DevBlog - Modern Blog Platform',
    description: 'A modern blog platform built with Next.js and Supabase. Discover programming insights, tutorials, and technical articles.',
    siteName: 'DevBlog',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DevBlog - Modern Blog Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevBlog - Modern Blog Platform',
    description: 'A modern blog platform built with Next.js and Supabase. Discover programming insights, tutorials, and technical articles.',
    images: ['/og-image.jpg'],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
          <WebVitals />
        </Providers>
      </body>
    </html>
  );
}

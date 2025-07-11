import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevBlog - Modern Blog Platform',
    short_name: 'DevBlog',
    description: 'A modern blog platform built with Next.js and Supabase',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['blog', 'productivity', 'education'],
    lang: 'en-US',
    orientation: 'portrait-primary',
  };
}
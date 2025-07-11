import { PostWithRelations } from '@/lib/blog';

interface JsonLdProps {
  type: 'website' | 'article' | 'blog';
  post?: PostWithRelations;
}

export function JsonLd({ type, post }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (type === 'website') {
    const websiteData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DevBlog',
      description: 'A modern blog platform built with Next.js and Supabase',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    );
  }

  if (type === 'blog') {
    const blogData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'DevBlog',
      description: 'A modern blog platform built with Next.js and Supabase',
      url: baseUrl,
      author: {
        '@type': 'Person',
        name: 'DevBlog',
      },
      publisher: {
        '@type': 'Organization',
        name: 'DevBlog',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogData) }}
      />
    );
  }

  if (type === 'article' && post) {
    const articleData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.content.substring(0, 160),
      author: {
        '@type': 'Person',
        name: 'DevBlog',
      },
      publisher: {
        '@type': 'Organization',
        name: 'DevBlog',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      url: `${baseUrl}/posts/${post.slug}`,
      image: post.cover_image_path ? [post.cover_image_path] : [`${baseUrl}/og-image.jpg`],
      articleSection: post.category?.name || 'General',
      keywords: post.tags?.map(tag => tag.name).join(', ') || '',
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
    );
  }

  return null;
}
import { PostWithRelations } from '@/lib/blog';

interface JsonLdProps {
  type: 'website' | 'article' | 'blog';
  post?: any;
}

function sanitizeContent(content: string): string {
  if (!content) return '';
  
  // Remove HTML tags and decode HTML entities
  const withoutTags = content.replace(/<[^>]*>/g, '');
  const withoutEntities = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove extra whitespace and newlines
  const cleaned = withoutEntities.replace(/\s+/g, ' ').trim();
  
  // Limit length and ensure safe characters
  return cleaned.length > 160 ? cleaned.substring(0, 160) + '...' : cleaned;
}

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('JSON.stringify error:', error);
    return '{}';
  }
}

export function JsonLd({ type, post }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (type === 'website') {
    const websiteData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Dev-eloper',
      description: 'Dev-eloper - A modern blog platform built with Next.js and Supabase',
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
        dangerouslySetInnerHTML={{ __html: safeStringify(websiteData) }}
      />
    );
  }

  if (type === 'blog') {
    const blogData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Dev-eloper',
      description: 'Dev-eloper - A modern blog platform built with Next.js and Supabase',
      url: baseUrl,
      author: {
        '@type': 'Person',
        name: 'Dev-eloper',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Dev-eloper',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeStringify(blogData) }}
      />
    );
  }

  if (type === 'article' && post) {
    const description = sanitizeContent(post.content || '');
    const articleData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title || 'Untitled',
      description: description || post.title || 'No description available',
      author: {
        '@type': 'Person',
        name: 'Dev-eloper',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Dev-eloper',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: post.created_at || new Date().toISOString(),
      dateModified: post.updated_at || post.created_at || new Date().toISOString(),
      url: `${baseUrl}/posts/${post.slug}`,
      image: post.cover_image_path ? [post.cover_image_path] : [`${baseUrl}/og-image.jpg`],
      articleSection: post.category?.name || 'General',
      keywords: post.tags?.map((tag: any) => tag.name).join(', ') || '',
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeStringify(articleData) }}
      />
    );
  }

  return null;
}
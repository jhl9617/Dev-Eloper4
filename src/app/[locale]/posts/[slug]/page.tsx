import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPostBySlug } from '@/lib/blog-server';
import { PostHeader } from '@/components/blog/post-header';
import { PostContent } from '@/components/blog/post-content';
import { PostFooter } from '@/components/blog/post-footer';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

// 동적 페이지 생성 설정 (ISR 적용)
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1시간마다 재검증

interface PostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate metadata for the post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }

    const publishedTime = post.published_at || post.created_at;
    const modifiedTime = post.updated_at;
    
    // Safe content extraction
    const safeContent = post.content || '';
    const textContent = safeContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const description = textContent.length > 160 
      ? textContent.substring(0, 160) + '...' 
      : textContent || post.title || 'No description available';

    return {
      title: post.title || 'Untitled Post',
      description,
      authors: [{ name: 'DevBlog' }],
      keywords: post.tags?.map(tag => tag.name).join(', ') || '',
      openGraph: {
        title: post.title || 'Untitled Post',
        description,
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: ['DevBlog'],
        section: post.category?.name || 'General',
        tags: post.tags?.map(tag => tag.name) || [],
        images: post.cover_image_path ? [
          {
            url: post.cover_image_path,
            width: 1200,
            height: 630,
            alt: post.title || 'Post image',
          }
        ] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title || 'Untitled Post',
        description,
        images: post.cover_image_path ? [post.cover_image_path] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error Loading Post',
      description: 'An error occurred while loading the post metadata.',
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    const t = await getTranslations({ locale, namespace: 'blog' });

    return (
      <>
        <JsonLd type="article" post={post} />
        <article className="container py-6 lg:py-10">
          <div className="mx-auto max-w-4xl">
            <PostHeader post={post} />
            <PostContent post={post} />
            <PostFooter post={post} />
          </div>
        </article>
      </>
    );
  } catch (error) {
    console.error('Error rendering post page:', error);
    notFound();
  }
}

// Generate static params for known posts (optional, for better performance)
export async function generateStaticParams() {
  // This could fetch popular posts or recent posts for pre-generation
  // For now, we'll let Next.js generate pages on-demand
  return [];
}
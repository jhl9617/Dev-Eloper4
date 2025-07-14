import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPostBySlug } from '@/lib/blog';
import { PostHeader } from '@/components/blog/post-header';
import { PostContent } from '@/components/blog/post-content';
import { PostFooter } from '@/components/blog/post-footer';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Generate metadata for the post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const publishedTime = post.published_at || post.created_at;
  const modifiedTime = post.updated_at;
  
  // Extract description from content (first 160 characters)
  const textContent = post.content.replace(/<[^>]*>/g, '').trim();
  const description = textContent.length > 160 
    ? textContent.substring(0, 160) + '...' 
    : textContent || post.title;

  return {
    title: post.title,
    description,
    authors: [{ name: 'DevBlog' }],
    keywords: post.tags?.map(tag => tag.name).join(', '),
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['DevBlog'],
      section: post.category?.name,
      tags: post.tags?.map(tag => tag.name),
      images: post.cover_image_path ? [
        {
          url: post.cover_image_path,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image_path ? [post.cover_image_path] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
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
}

// Generate static params for known posts (optional, for better performance)
export async function generateStaticParams() {
  // This could fetch popular posts or recent posts for pre-generation
  // For now, we'll let Next.js generate pages on-demand
  return [];
}
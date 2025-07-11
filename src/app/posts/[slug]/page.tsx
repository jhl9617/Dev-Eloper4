import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { createClient } from '@/lib/supabase/client';
import { getPostBySlug } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/json-ld';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const description = post.content
    .replace(/[#*`]/g, '')
    .slice(0, 160) + (post.content.length > 160 ? '...' : '');

  return {
    title: post.title,
    description,
    keywords: post.tags?.map(tag => tag.name).join(', '),
    authors: [{ name: 'DevBlog' }],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: ['DevBlog'],
      tags: post.tags?.map(tag => tag.name),
      images: post.cover_image_path ? [
        {
          url: post.cover_image_path,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image_path ? [post.cover_image_path] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.published_at 
    ? new Date(post.published_at) 
    : new Date(post.created_at);

  // Estimate reading time (average 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <>
      <JsonLd type="article" post={post} />
      <div className="container py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <header className="mb-8">
        {post.cover_image_path && (
          <div className="aspect-[16/9] overflow-hidden rounded-lg mb-6 relative">
            <Image
              src={post.cover_image_path}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-4">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {post.category.name}
              </Badge>
            </Link>
          )}

          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <span>{format(publishedDate, 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>DevBlog</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-accent">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <Separator className="mb-8" />

      {/* Content */}
      <article className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return (
                <code className={match ? className : "bg-muted px-1 py-0.5 rounded text-sm"} {...props}>
                  {children}
                </code>
              );
            },
            a({ href, children, ...props }) {
              // External links open in new tab
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      <Separator className="my-8" />

      {/* Footer */}
      <footer className="space-y-6">
        {/* Share */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share this post</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </Button>
          </div>
        </div>

        {/* Related Posts Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Posts
            </Link>
          </Button>
          {post.category && (
            <Button variant="outline" asChild>
              <Link href={`/categories/${post.category.slug}`}>
                More in {post.category.name}
              </Link>
            </Button>
          )}
        </div>
      </footer>
      </div>
    </>
  );
}
'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { CalendarDays, Clock, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { PostWithRelations } from '@/lib/blog';
import { LazyImage } from '@/components/ui/lazy-image';

interface PostHeaderProps {
  post: PostWithRelations;
}

export function PostHeader({ post }: PostHeaderProps) {
  const t = useTranslations('blog');
  
  const publishedDate = post.published_at 
    ? new Date(post.published_at) 
    : new Date(post.created_at);

  // Estimate reading time (average 200 words per minute)
  const textContent = post.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <header className="space-y-6">
      {/* Category */}
      {post.category && (
        <div>
          <Link href={`/categories/${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-secondary/80">
              {post.category.name}
            </Badge>
          </Link>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {post.title}
      </h1>


      {/* Cover Image */}
      {post.cover_image_path && (
        <div className="aspect-[16/9] overflow-hidden rounded-lg">
          <LazyImage
            src={post.cover_image_path}
            alt={post.title}
            className="h-full w-full object-cover"
            width={800}
            height={450}
            priority
          />
        </div>
      )}

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <CalendarDays className="h-4 w-4" />
          <span>{format(publishedDate, 'MMMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{t('readingTime', { minutes: readingTime })}</span>
        </div>
      </div>

      {/* Tags */}
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
    </header>
  );
}
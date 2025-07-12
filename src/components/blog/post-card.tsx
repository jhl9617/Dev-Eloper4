'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { memo, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { HtmlPreview } from '@/components/blog/html-content';
import { getPostThumbnail } from '@/lib/utils/html-utils';
import { CalendarDays, Clock, User, ImageIcon } from 'lucide-react';
import type { PostWithRelations } from '@/lib/blog';

interface PostCardProps {
  post: PostWithRelations;
}

export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  const { publishedDate, readingTime, thumbnailUrl } = useMemo(() => {
    const publishedDate = post.published_at 
      ? new Date(post.published_at) 
      : new Date(post.created_at);

    // Estimate reading time (average 200 words per minute)
    const textContent = post.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Get thumbnail (cover image or first image from content)
    const thumbnailUrl = getPostThumbnail(post.cover_image_path, post.content);

    return { publishedDate, readingTime, thumbnailUrl };
  }, [post.content, post.published_at, post.created_at, post.cover_image_path]);

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-lg">
      {/* Thumbnail Section */}
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="aspect-[16/9] overflow-hidden rounded-t-lg relative">
          {thumbnailUrl ? (
            <LazyImage
              src={thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              width={400}
              height={225}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="flex-1">
        <div className="space-y-2">
          {post.category && (
            <Link 
              href={`/categories/${post.category.slug}`}
              className="inline-block"
            >
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {post.category.name}
              </Badge>
            </Link>
          )}
          
          <Link href={`/posts/${post.slug}`} className="block group">
            <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <Link href={`/posts/${post.slug}`} className="block group">
          <HtmlPreview 
            content={post.content}
            maxLength={150}
            className="line-clamp-3 group-hover:text-foreground/80 transition-colors"
          />
        </Link>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 w-full">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge variant="outline" className="text-xs hover:bg-accent">
                  {tag.name}
                </Badge>
              </Link>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CalendarDays className="h-3 w-3" />
              <span>{format(publishedDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
});
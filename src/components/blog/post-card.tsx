'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MotionBadge } from '@/components/ui/motion-badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { HtmlPreview } from '@/components/blog/html-content';
import { getPostThumbnail } from '@/lib/utils/html-utils';
import { CalendarDays, Clock, User, ImageIcon } from 'lucide-react';
import { cardVariants, getReducedMotionVariants } from '@/lib/animations';
import type { PostWithRelations } from '@/lib/blog';

interface PostCardProps {
  post: any;
  priority?: boolean;
  index?: number;
}

export const PostCard = memo(function PostCard({ post, priority = false, index = 0 }: PostCardProps) {
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

  const motionVariants = getReducedMotionVariants(cardVariants);

  return (
    <motion.div
      variants={motionVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      transition={{
        delay: index * 0.1,
      }}
      className="h-full"
    >
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm group">
        {/* Thumbnail Section */}
        <Link href={`/posts/${post.slug}`} className="block">
          <div className="aspect-[16/9] overflow-hidden rounded-t-lg relative">
            {thumbnailUrl ? (
              <motion.div
                className="h-full w-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <LazyImage
                  src={thumbnailUrl}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  width={400}
                  height={225}
                  priority={priority}
                />
              </motion.div>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/60 animate-pulse" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      
      <CardHeader className="flex-1">
        <div className="space-y-2">
          {post.category && (
            <Link 
              href={`/categories/${post.category.slug}`}
              className="inline-block"
            >
              <MotionBadge variant="secondary">
                {post.category.name}
              </MotionBadge>
            </Link>
          )}
          
          <Link href={`/posts/${post.slug}`} className="block group">
            <motion.h3 
              className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors"
              layoutId={`title-${post.id}`}
            >
              {post.title}
            </motion.h3>
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
                <MotionBadge variant="outline" className="text-xs">
                  {tag.name}
                </MotionBadge>
              </Link>
            ))}
            {post.tags.length > 3 && (
              <MotionBadge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </MotionBadge>
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
    </motion.div>
  );
});
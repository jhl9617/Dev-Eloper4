'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('blog');
  
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
      <Link href={`/posts/${post.slug}`} className="block h-full">
        <Card className="h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 border-0 bg-white dark:bg-gray-900 hover:-translate-y-1 hover:scale-[1.02] group rounded-2xl overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 cursor-pointer">
          {/* Thumbnail Section */}
          <div className="aspect-[16/9] overflow-hidden relative">
            {thumbnailUrl ? (
              <motion.div
                className="h-full w-full"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
      
          <CardHeader className="flex-1 p-6 pb-0">
            <div className="space-y-4">
              {post.category && (
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/categories/${post.category.slug}`;
                  }}
                  className="inline-block cursor-pointer"
                >
                  <MotionBadge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300">
                    {post.category.name}
                  </MotionBadge>
                </div>
              )}
              
              <motion.h3 
                className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-all duration-300 leading-tight"
                layoutId={`title-${post.id}`}
              >
                {post.title}
              </motion.h3>
            </div>
          </CardHeader>

          <CardContent className="flex-1 px-6 py-4">
            <HtmlPreview 
              content={post.content}
              maxLength={120}
              className="line-clamp-3 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-all duration-300 leading-relaxed"
            />
          </CardContent>

          <CardFooter className="px-6 pb-6 pt-2">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <div
                    key={tag.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/tags/${tag.slug}`;
                    }}
                    className="cursor-pointer"
                  >
                    <MotionBadge variant="outline" className="text-xs rounded-full px-2 py-1 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-all duration-300">
                      {tag.name}
                    </MotionBadge>
                  </div>
                ))}
                {post.tags.length > 3 && (
                  <MotionBadge variant="outline" className="text-xs rounded-full px-2 py-1 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                    +{post.tags.length - 3}
                  </MotionBadge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between w-full text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-medium">{format(publishedDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{t('readingTime', { minutes: readingTime })}</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
});
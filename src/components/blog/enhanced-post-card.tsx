"use client";

import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MotionCard, ScrollReveal, AnimatedText } from '@/components/ui/motion-components';
import { useInView, useMousePosition } from '@/hooks/use-scroll-animations';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    content?: string;
    slug: string;
    published_at: string;
    updated_at?: string;
    reading_time?: number;
    view_count?: number;
    featured_image?: string;
    tags: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
    category?: {
      id: string;
      name: string;
      color?: string;
    };
  };
  variant?: 'default' | 'featured' | 'compact' | 'glass';
  showImage?: boolean;
  showStats?: boolean;
  index?: number;
  locale?: string;
}

export const EnhancedPostCard = ({
  post,
  variant = 'default',
  showImage = true,
  showStats = true,
  index = 0,
  locale = 'ko',
}: PostCardProps) => {
  const [ref, isInView] = useInView(0.2);
  const mousePosition = useMousePosition();

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3,
      },
    },
  };

  const getCardStyles = () => {
    const baseStyles = "group relative overflow-hidden transition-all duration-300";
    
    switch (variant) {
      case 'featured':
        return cn(baseStyles, "col-span-2 row-span-2 glass-card shadow-strong");
      case 'compact':
        return cn(baseStyles, "shadow-soft");
      case 'glass':
        return cn(baseStyles, "glass-card shadow-medium");
      default:
        return cn(baseStyles, "bg-card border shadow-soft");
    }
  };

  const getImageHeight = () => {
    switch (variant) {
      case 'featured':
        return 'h-64 md:h-80';
      case 'compact':
        return 'h-32';
      default:
        return 'h-48';
    }
  };

  return (
    <ScrollReveal delay={index * 0.1}>
      <Link href={`/${locale}/posts/${post.slug}`} className="block">
        <motion.article
          ref={ref}
          className={getCardStyles()}
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
        >
          {/* Background Pattern for Glass Effect */}
          {variant === 'glass' && (
            <div className="absolute inset-0 gradient-mesh opacity-30" />
          )}

          {/* Featured Badge */}
          {variant === 'featured' && (
            <motion.div
              className="absolute top-4 left-4 z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg">
                Featured
              </Badge>
            </motion.div>
          )}

          {/* Image Section */}
          {showImage && post.featured_image && (
            <motion.div 
              className={cn("relative overflow-hidden", getImageHeight())}
              variants={imageVariants}
            >
              <Image
                src={post.featured_image || `https://picsum.photos/800/400?random=${post.id}`}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Hover Overlay */}
              <motion.div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                variants={overlayVariants}
                initial="hidden"
                whileHover="hover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Reading Time Badge */}
              {post.reading_time && variant === 'featured' && (
                <motion.div
                  className="absolute bottom-4 right-4 glass-card px-3 py-1 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-1 text-white text-sm font-medium">
                    <Clock className="w-3 h-3" />
                    {post.reading_time}분
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Content Section */}
          <motion.div
            className={cn(
              "p-6",
              variant === 'featured' ? "p-8" : "",
              variant === 'compact' ? "p-4" : ""
            )}
            variants={contentVariants}
          >
            {/* Category & Tags */}
            <div className="flex items-center gap-2 mb-3">
              {post.category && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: post.category.color || undefined,
                    color: post.category.color ? 'white' : undefined,
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
              
              {post.tags.slice(0, 2).map((tag, tagIndex) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + tagIndex * 0.1 }}
                >
                  <Badge variant="outline" className="text-xs">
                    <Tag className="w-2 h-2 mr-1" />
                    {tag.name}
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* Title */}
            <motion.h3
              className={cn(
                "font-bold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors",
                variant === 'featured' ? "text-xl md:text-2xl" : "text-lg",
                variant === 'compact' ? "text-base" : ""
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {post.title}
            </motion.h3>

            {/* Excerpt */}
            {variant !== 'compact' && (
              <motion.p
                className={cn(
                  "text-muted-foreground mb-4",
                  variant === 'featured' ? "text-base line-clamp-3" : "text-sm line-clamp-2"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {post.excerpt}
              </motion.p>
            )}

            {/* Meta Information */}
            <motion.div
              className="flex items-center justify-between text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.published_at)}
                </div>
                
                {showStats && post.reading_time && variant !== 'featured' && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.reading_time}분
                  </div>
                )}
                
                {showStats && post.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.view_count}
                  </div>
                )}
              </div>

              {/* Read More Indicator */}
              <motion.div
                className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all"
                whileHover={{ x: 5 }}
              >
                <span className="hidden sm:inline">자세히 보기</span>
                <ArrowRight className="w-3 h-3" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Interactive Border Effect */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 pointer-events-none"
            whileHover={{
              opacity: 0.5,
              transition: { duration: 0.3 },
            }}
          />
        </motion.article>
      </Link>
    </ScrollReveal>
  );
};
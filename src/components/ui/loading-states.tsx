"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Skeleton Loader Components
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton = ({ className, animate = true }: SkeletonProps) => {
  return (
    <motion.div
      className={cn(
        "bg-muted rounded-md",
        animate && "shimmer",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// Post Card Skeleton
export const PostCardSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'featured' | 'compact' }) => {
  return (
    <motion.div
      className={cn(
        "border rounded-lg overflow-hidden bg-card",
        variant === 'featured' && "col-span-2 row-span-2",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Image Skeleton */}
      <Skeleton 
        className={cn(
          "w-full",
          variant === 'featured' ? "h-64 md:h-80" : "h-48",
          variant === 'compact' ? "h-32" : ""
        )} 
      />
      
      <div className={cn("p-6", variant === 'compact' ? "p-4" : "")}>
        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        
        {/* Title Skeleton */}
        <Skeleton className={cn("h-6 mb-3", variant === 'featured' ? "h-8" : "")} />
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        {/* Excerpt Skeleton */}
        {variant !== 'compact' && (
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            {variant === 'featured' && <Skeleton className="h-4 w-4/6" />}
          </div>
        )}
        
        {/* Meta Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </motion.div>
  );
};

// Comment Skeleton
export const CommentSkeleton = ({ showReplies = false }: { showReplies?: boolean }) => {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {showReplies && (
        <div className="ml-14 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Grid Skeleton for post listings
export const PostGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Loading Dots Animation
export const LoadingDots = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
      },
    },
  };

  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className="flex items-center gap-1"
      variants={containerVariants}
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-primary rounded-full", dotSizes[size])}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
};

// Pulse Loader
export const PulseLoader = ({ className }: { className?: string }) => {
  return (
    <motion.div
      className={cn("w-8 h-8 bg-primary rounded-full", className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Spinner with custom colors
export const ColorfulSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn("relative", sizes[size])}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
    </motion.div>
  );
};

// Loading Screen Overlay
export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-card border rounded-lg p-8 shadow-lg text-center max-w-sm w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="mb-4 flex justify-center">
          <ColorfulSpinner size="lg" />
        </div>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// Shimmer Effect for images
export const ImageSkeleton = ({ 
  width = "100%", 
  height = "200px",
  className 
}: { 
  width?: string | number;
  height?: string | number;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn("bg-muted rounded-md shimmer relative overflow-hidden", className)}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
    </motion.div>
  );
};

// Text Loading Animation
export const TextLoader = ({ lines = 3, className }: { lines?: number; className?: string }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Skeleton 
            className={cn(
              "h-4",
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Progress Loading Bar
export const ProgressLoader = ({ progress, className }: { progress: number; className?: string }) => {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2", className)}>
      <motion.div
        className="bg-primary h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};
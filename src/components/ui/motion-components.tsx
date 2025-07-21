"use client";

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  cardVariants,
  buttonVariants,
  fadeInVariants,
  slideUpVariants,
  scaleVariants,
  getReducedMotionVariants,
} from '@/lib/animations';

// Base Motion Card Component
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'interactive';
  hover?: boolean;
  className?: string;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, variant = 'default', hover = true, className, ...props }, ref) => {
    const baseClasses = "rounded-lg overflow-hidden";
    
    const variantClasses = {
      default: "bg-card border shadow-soft",
      glass: "glass-card",
      interactive: "bg-card border shadow-soft interactive-element cursor-pointer"
    };

    const variants = getReducedMotionVariants(cardVariants);

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        variants={variants}
        initial="hidden"
        animate="visible"
        whileHover={hover ? "hover" : undefined}
        whileTap={hover ? "tap" : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// Enhanced Motion Button
interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'default' | 'like' | 'interactive';
  isLiked?: boolean;
  className?: string;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, variant = 'default', isLiked = false, className, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    const getVariants = () => {
      switch (variant) {
        case 'like':
          return getReducedMotionVariants(buttonVariants);
        case 'interactive':
          return getReducedMotionVariants({
            ...buttonVariants,
            hover: {
              ...buttonVariants.hover,
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }
          });
        default:
          return getReducedMotionVariants(buttonVariants);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, className)}
        variants={getVariants()}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={variant === 'like' && isLiked ? "liked" : "initial"}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";

// Scroll Reveal Container
interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={getReducedMotionVariants(slideUpVariants)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";

// Staggered Children Container
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className, staggerDelay = 0.1, ...props }, ref) => {
    const variants = getReducedMotionVariants({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.2,
        },
      },
    });

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = "StaggerContainer";

// Animated Text Component
interface AnimatedTextProps {
  text: string;
  className?: string;
  variant?: 'fadeIn' | 'slideUp' | 'scale';
  delay?: number;
}

export const AnimatedText = ({ text, className, variant = 'fadeIn', delay = 0 }: AnimatedTextProps) => {
  const getVariants = () => {
    switch (variant) {
      case 'slideUp':
        return getReducedMotionVariants(slideUpVariants);
      case 'scale':
        return getReducedMotionVariants(scaleVariants);
      default:
        return getReducedMotionVariants(fadeInVariants);
    }
  };

  return (
    <motion.span
      className={className}
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {text}
    </motion.span>
  );
};

// Enhanced Comment Component
interface MotionCommentProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  index?: number;
}

export const MotionComment = forwardRef<HTMLDivElement, MotionCommentProps>(
  ({ children, className, index = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={getReducedMotionVariants(fadeInVariants)}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        transition={{ delay: index * 0.1 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionComment.displayName = "MotionComment";

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  const variants = getReducedMotionVariants({
    initial: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(4px)",
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  });

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-2 border-transparent border-t-current",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar = ({ progress, className, showPercentage = false }: ProgressBarProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
      {showPercentage && (
        <motion.span
          className="absolute right-0 top-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
};
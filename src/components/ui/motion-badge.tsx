'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge, BadgeProps } from '@/components/ui/badge';

interface MotionBadgeProps extends BadgeProps {
  children: React.ReactNode;
  pulse?: boolean;
  bounce?: boolean;
}

export const MotionBadge = React.forwardRef<
  HTMLDivElement,
  MotionBadgeProps
>(({ 
  className, 
  variant, 
  children, 
  pulse = false,
  bounce = false,
  ...props 
}, ref) => {
  const MotionBadgeComponent = motion(Badge);
  
  return (
    <MotionBadgeComponent
      whileHover={{ 
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      variant={variant}
      ref={ref}
      className={cn(
        "cursor-pointer transition-colors inline-block",
        pulse && "animate-pulse",
        bounce && "animate-bounce",
        className
      )}
      {...props}
    >
      {children}
    </MotionBadgeComponent>
  );
});

MotionBadge.displayName = "MotionBadge";
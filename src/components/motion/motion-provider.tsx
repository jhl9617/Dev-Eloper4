'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { ReactNode } from 'react';
import { easings } from '@/lib/animations';

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
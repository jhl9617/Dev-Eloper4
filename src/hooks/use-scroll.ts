'use client';

import { useState, useEffect } from 'react';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down' | null;
  isAtTop: boolean;
}

export function useScroll() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollDirection: null,
    isAtTop: true,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
      const isAtTop = scrollY < 10;

      setScrollState({
        scrollY,
        scrollDirection,
        isAtTop,
      });

      lastScrollY = scrollY;
    };

    const handleScroll = () => {
      requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollState;
}
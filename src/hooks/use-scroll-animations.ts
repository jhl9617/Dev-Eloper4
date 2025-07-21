"use client";

import { useEffect, useState, useRef, MutableRefObject } from 'react';
import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

// Scroll progress hook
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalDocScrollLength = docHeight - windowHeight;
      const scrollPosition = scrollTop / totalDocScrollLength;
      
      setScrollProgress(Math.min(scrollPosition * 100, 100));
    };

    const throttledScrollHandler = throttle(calculateScrollProgress, 16);
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    calculateScrollProgress();
    
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, []);

  return scrollProgress;
};

// Parallax scroll hook
export const useParallax = (speed: number = 0.5): MotionValue<number> => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);
  return y;
};

// Smooth scroll hook with spring animation
export const useSmoothScroll = () => {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    damping: 50,
    stiffness: 400,
    restDelta: 0.5,
  });

  return smoothScrollY;
};

// Scroll direction hook
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateScrollDirection = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (Math.abs(scrollTop - lastScrollTop.current) < 5) return;
      
      setScrollDirection(scrollTop > lastScrollTop.current ? 'down' : 'up');
      setIsScrolling(true);
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 150);
    };

    const throttledUpdateScrollDirection = throttle(updateScrollDirection, 16);
    
    window.addEventListener('scroll', throttledUpdateScrollDirection, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledUpdateScrollDirection);
      clearTimeout(timeoutId);
    };
  }, []);

  return { scrollDirection, isScrolling };
};

// Element in view hook
export const useInView = (threshold: number = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin: '-50px' }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  return [ref, isInView] as const;
};

// Scroll to element with smooth animation
export const useScrollTo = () => {
  const scrollTo = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return { scrollTo, scrollToTop };
};

// Dynamic header hook (hide/show based on scroll)
export const useDynamicHeader = (threshold: number = 100) => {
  const [isVisible, setIsVisible] = useState(true);
  const { scrollDirection, isScrolling } = useScrollDirection();

  useEffect(() => {
    const scrollTop = window.pageYOffset;
    
    if (scrollTop < threshold) {
      setIsVisible(true);
    } else if (scrollDirection === 'down' && isScrolling) {
      setIsVisible(false);
    } else if (scrollDirection === 'up' && isScrolling) {
      setIsVisible(true);
    }
  }, [scrollDirection, isScrolling, threshold]);

  return isVisible;
};

// Scroll-based animations hook
export const useScrollAnimations = (ref: MutableRefObject<HTMLElement | null>) => {
  const [animations, setAnimations] = useState({
    opacity: 0,
    y: 50,
    scale: 0.95,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimations({
            opacity: 1,
            y: 0,
            scale: 1,
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [ref]);

  return animations;
};

// Mouse position hook for interactive effects
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const throttledUpdateMousePosition = throttle(updateMousePosition, 16);
    
    window.addEventListener('mousemove', throttledUpdateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', throttledUpdateMousePosition);
    };
  }, []);

  return mousePosition;
};

// Reduced motion preference hook
export const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return shouldReduceMotion;
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= wait) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastRan), 0));
    }
  };
}
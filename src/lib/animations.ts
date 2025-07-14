import { Variants } from 'framer-motion';

// 공통 easing functions - 안전한 설정으로 변경
export const easings = {
  easeInOut: "easeInOut",
  easeOut: "easeOut", 
  easeIn: "easeIn",
  spring: { type: "spring" as const, damping: 25, stiffness: 300 },
  springBounce: { type: "spring" as const, damping: 20, stiffness: 400 },
  springSmooth: { type: "spring" as const, damping: 30, stiffness: 200 },
};

// 페이지 트랜지션 variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// 컨테이너 stagger variants
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 카드 애니메이션 variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      type: "spring",
      damping: 30,
      stiffness: 200,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// 모달 애니메이션 variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      damping: 20,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// 드롭다운 애니메이션 variants
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

// 헤더 애니메이션 variants
export const headerVariants: Variants = {
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hidden: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// 버튼 애니메이션 variants
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// 페이드 인 애니메이션
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// 슬라이드 업 애니메이션
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// 스케일 애니메이션
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      type: "spring",
      damping: 30,
      stiffness: 200,
    },
  },
};

// 리스트 아이템 애니메이션
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// 로딩 애니메이션을 위한 유틸리티
export const loadingVariants: Variants = {
  loading: {
    opacity: 0.5,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

// Reduced motion을 고려한 애니메이션 설정
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reduced motion이 설정된 경우 애니메이션을 단순화
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = {
        ...variants[key],
        transition: { duration: 0.01 },
      };
      return acc;
    }, {} as Variants);
  }
  return variants;
};
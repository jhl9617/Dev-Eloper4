"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Moon, Sun, ChevronDown, Home, User, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDynamicHeader, useScrollProgress, useScrollDirection } from '@/hooks/use-scroll-animations';
import { MotionButton } from '@/components/ui/motion-components';

interface HeaderProps {
  locale: string;
  isDark: boolean;
  toggleTheme: () => void;
  className?: string;
}

export const EnhancedHeader = ({ locale, isDark, toggleTheme, className }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isHeaderVisible = useDynamicHeader(100);
  const scrollProgress = useScrollProgress();
  const { scrollDirection } = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: `/${locale}`, label: locale === 'ko' ? '홈' : 'Home', icon: Home },
    { href: `/${locale}/posts`, label: locale === 'ko' ? '블로그' : 'Blog', icon: BookOpen },
    { href: `/${locale}/about`, label: locale === 'ko' ? '소개' : 'About', icon: User },
    { href: `/${locale}/contact`, label: locale === 'ko' ? '연락처' : 'Contact', icon: Mail },
  ];

  const headerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
      backgroundColor: isScrolled 
        ? isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"
        : "transparent",
      borderBottom: isScrolled ? "1px solid hsl(var(--border))" : "1px solid transparent",
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const searchVariants = {
    closed: {
      width: 0,
      opacity: 0,
    },
    open: {
      width: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-3 z-50 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress / 100 }}
        transition={{ duration: 0.1 }}
      />

      <motion.header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          className
        )}
        variants={headerVariants}
        animate={isHeaderVisible ? "visible" : "hidden"}
        initial="visible"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div variants={logoVariants} whileHover="hover" whileTap="tap">
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center text-white font-bold">
                  D
                </div>
                <motion.span 
                  className="text-xl font-bold text-foreground hidden sm:block"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Dev-Eloper
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div
                    variants={searchVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      placeholder={locale === 'ko' ? '검색...' : 'Search...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="hidden sm:flex"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                )}
              </AnimatePresence>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="relative overflow-hidden"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </Button>

              {/* Language Toggle */}
              <Button variant="ghost" size="sm">
                <Badge variant="outline" className="text-xs">
                  {locale.toUpperCase()}
                </Badge>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="md:hidden bg-card/95 backdrop-blur-lg rounded-lg mt-2 border overflow-hidden"
              >
                <div className="py-4">
                  {/* Mobile Search */}
                  <motion.div
                    variants={menuItemVariants}
                    className="px-4 mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={locale === 'ko' ? '검색...' : 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </motion.div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div key={item.href} variants={menuItemVariants}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};
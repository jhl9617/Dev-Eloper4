'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useScroll } from '@/hooks/use-scroll';
import { SearchInput } from '@/components/search/search-input';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { headerVariants } from '@/lib/animations';

function AuthButton() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-9 w-9 rounded-full">
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
        <Link href="/auth/login">
          <User className="h-4 w-4" />
          <span className="sr-only">{t('login')}</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
          <User className="h-4 w-4" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm font-medium">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                {t('admin')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          {tAuth('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('navigation');
  const tSearch = useTranslations('search');
  const { scrollDirection, isAtTop, scrollY } = useScroll();

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/categories', label: t('categories') },
    { href: '/about', label: t('about') },
  ];

  const shouldHideHeader = scrollDirection === 'down' && scrollY > 100;

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      variants={headerVariants}
      animate={shouldHideHeader ? 'hidden' : 'visible'}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backdropFilter: isAtTop ? 'none' : 'blur(20px)',
        borderBottomColor: isAtTop ? 'transparent' : 'hsl(var(--border))',
        boxShadow: isAtTop ? 'none' : '0 1px 0 0 hsl(var(--border))',
      }}
    >
      <div className="container flex h-16 items-center px-6 lg:px-8">
        {/* Logo */}
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-semibold text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">
              DevBlog
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/70 transition-all duration-200 hover:text-foreground hover:scale-105 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="ml-auto flex items-center space-x-3">
          <div className="hidden lg:block w-72">
            <SearchInput placeholder={tSearch('searchPlaceholder')} />
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <AuthButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="ml-auto px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="pr-0">
            <nav className="flex flex-col space-y-3">
              <div className="mb-4">
                <SearchInput placeholder={tSearch('searchPlaceholder')} />
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-1 text-lg transition-colors hover:text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-4" />
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-lg">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-lg">Language</span>
                <LanguageToggle />
              </div>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-2 py-1 text-lg transition-colors hover:text-foreground/80"
              >
                {t('admin')}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
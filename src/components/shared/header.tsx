'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { SearchInput } from '@/components/search/search-input';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

function AuthButton() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
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
        <Button variant="ghost" size="sm">
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

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/categories', label: t('categories') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">DevBlog</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:block w-64">
            <SearchInput placeholder={tSearch('searchPlaceholder')} />
          </div>
          <ThemeToggle />
          <LanguageToggle />
          <AuthButton />
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
    </header>
  );
}
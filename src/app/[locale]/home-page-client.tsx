'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { containerVariants, pageVariants } from '@/lib/animations';

interface HomePageClientProps {
  posts: any[];
  total: number;
  translations: {
    allPosts: string;
    recentPosts: string;
    noPostsFound: string;
    categories: string;
    about: string;
  };
}

export function HomePageClient({ posts, total, translations }: HomePageClientProps) {
  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-gray-50 dark:to-gray-900 py-20 lg:py-32">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-gray-600 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Dev-eloper
              </span>
            </motion.h1>
            <motion.p 
              className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Discover articles about web development, programming, and technology. 
              Stay updated with the latest trends and best practices.
            </motion.p>
          </div>
          <motion.div 
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <MotionButton asChild size="lg" className="rounded-full px-8 py-4 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              <Link href="/posts">
                <BookOpen className="mr-2 h-5 w-5" />
                {translations.allPosts}
              </Link>
            </MotionButton>
            <MotionButton variant="outline" size="lg" asChild className="rounded-full px-8 py-4 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
              <Link href="/categories">
                {translations.categories}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </MotionButton>
          </motion.div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  {translations.recentPosts}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                  Explore our latest articles and insights on web development, programming best practices, and cutting-edge technology trends.
                </p>
              </div>
              {total > 6 && (
                <Button variant="outline" asChild className="mt-6 lg:mt-0 rounded-full px-6 py-3 font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <Link href="/posts">
                    {translations.allPosts}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{translations.noPostsFound}</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg">
                  There are no published articles yet. Check back soon for new content!
                </p>
              </div>
            ) : (
              <motion.div 
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {posts.map((post: any, index: number) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    priority={index === 0}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter/CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Stay Updated
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Follow us for the latest articles and insights in web development, programming best practices, and technology trends.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" asChild className="rounded-full px-8 py-4 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <Link href="/rss">
                  RSS Feed
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-8 py-4 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <Link href="/about">
                  {translations.about}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
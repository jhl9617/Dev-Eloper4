import { Suspense } from 'react';
import { getPublishedPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';

export default async function HomePage() {
  const { posts, total } = await getPublishedPosts(6);

  return (
    <>
      <JsonLd type="website" />
      <JsonLd type="blog" />
      <div className="container py-8 lg:py-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 pb-8 lg:pb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to DevBlog
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Discover articles about web development, programming, and technology.
            Stay updated with the latest trends and best practices.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild size="lg">
            <Link href="/posts">
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Articles
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/categories">
              Browse Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Latest Posts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            Latest Articles
          </h2>
          {total > 6 && (
            <Button variant="outline" asChild>
              <Link href="/posts">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-sm">
              There are no published articles yet. Check back soon for new content!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter/CTA Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            Stay Updated
          </h2>
          <p className="text-muted-foreground">
            Follow us for the latest articles and insights in web development.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/rss">
                RSS Feed
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">
                About
              </Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

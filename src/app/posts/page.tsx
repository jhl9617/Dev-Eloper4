import { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface PostsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'All Posts - DevBlog',
  description: 'Browse all blog posts about web development, programming, and technology.',
  openGraph: {
    title: 'All Posts - DevBlog',
    description: 'Browse all blog posts about web development, programming, and technology.',
  },
};

const POSTS_PER_PAGE = 12;

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const { posts, total } = await getPublishedPosts(POSTS_PER_PAGE, offset);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All Posts
          </h1>
          <p className="text-muted-foreground mt-2">
            {total} {total === 1 ? 'post' : 'posts'} published
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground max-w-sm">
            There are no published posts yet. Check back soon for new content!
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                asChild
                disabled={!hasPrevPage}
              >
                {hasPrevPage ? (
                  <Link href={currentPage === 2 ? '/posts' : `/posts?page=${currentPage - 1}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </span>
                )}
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    asChild={page !== currentPage}
                  >
                    {page === currentPage ? (
                      <span>{page}</span>
                    ) : (
                      <Link href={page === 1 ? '/posts' : `/posts?page=${page}`}>
                        {page}
                      </Link>
                    )}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                asChild
                disabled={!hasNextPage}
              >
                {hasNextPage ? (
                  <Link href={`/posts?page=${currentPage + 1}`}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <span className="flex items-center">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByTag, getTags } from '@/lib/blog-server';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface TagPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tags = await getTags();
  const tag = tags.find(t => t.slug === slug);

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `#${tag.name} - DevBlog`,
    description: `Browse all posts tagged with ${tag.name}.`,
    openGraph: {
      title: `#${tag.name} - DevBlog`,
      description: `Browse all posts tagged with ${tag.name}.`,
    },
  };
}

const POSTS_PER_PAGE = 12;

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, slug } = await params;
  const searchParamsValue = await searchParams;
  const currentPage = Number(searchParamsValue.page) || 1;
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // Get tag info
  const tags = await getTags();
  const tag = tags.find(t => t.slug === slug);

  if (!tag) {
    notFound();
  }

  // Get posts with this tag
  const { posts, total } = await getPostsByTag(slug, POSTS_PER_PAGE, offset);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span>Tag: {tag.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-muted-foreground">#</span>{tag.name}
              </h1>
              <p className="text-muted-foreground">
                {total} {total === 1 ? 'post' : 'posts'} tagged with {tag.name}
              </p>
            </div>
          </div>
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
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts with this tag yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Posts tagged with <Badge variant="outline">#{tag.name}</Badge> will appear here once they are published.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/posts">
              Browse All Posts
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {posts.map((post: any) => (
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
                  <Link href={currentPage === 2 ? `/tags/${slug}` : `/tags/${slug}?page=${currentPage - 1}`}>
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
                      <Link href={page === 1 ? `/tags/${slug}` : `/tags/${slug}?page=${page}`}>
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
                  <Link href={`/tags/${slug}?page=${currentPage + 1}`}>
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
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory, getCategories } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Folder } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(cat => cat.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - DevBlog`,
    description: `Browse all posts in the ${category.name} category.`,
    openGraph: {
      title: `${category.name} - DevBlog`,
      description: `Browse all posts in the ${category.name} category.`,
    },
  };
}

const POSTS_PER_PAGE = 12;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsValue = await searchParams;
  const currentPage = Number(searchParamsValue.page) || 1;
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // Get category info
  const categories = await getCategories();
  const category = categories.find(cat => cat.slug === slug);

  if (!category) {
    notFound();
  }

  // Get posts in this category
  const { posts, total } = await getPostsByCategory(slug, POSTS_PER_PAGE, offset);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/categories" className="hover:text-primary">
              Categories
            </Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Folder className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {total} {total === 1 ? 'post' : 'posts'} in this category
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Categories
          </Link>
        </Button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts in this category yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Posts in the {category.name} category will appear here once they are published.
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
                  <Link href={currentPage === 2 ? `/categories/${slug}` : `/categories/${slug}?page=${currentPage - 1}`}>
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
                      <Link href={page === 1 ? `/categories/${slug}` : `/categories/${slug}?page=${page}`}>
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
                  <Link href={`/categories/${slug}?page=${currentPage + 1}`}>
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
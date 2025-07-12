'use client';

import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import type { PostWithRelations } from '@/lib/blog';

interface SearchResultsProps {
  posts: PostWithRelations[];
  total: number;
  currentPage: number;
  totalPages: number;
  query: string;
  searchParams: {
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  };
}

export function SearchResults({ 
  posts, 
  total, 
  currentPage, 
  totalPages, 
  query, 
  searchParams 
}: SearchResultsProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Build URL with current search params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.tag) params.set('tag', searchParams.tag);
    if (page > 1) params.set('page', page.toString());
    
    return `/search${params.toString() ? `?${params.toString()}` : ''}`;
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Start searching</h3>
        <p className="text-muted-foreground max-w-sm">
          Enter a search term to find posts about web development, programming, and technology.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground max-w-sm">
          We couldn&apos;t find any posts matching &quot;{query}&quot;. Try different keywords or browse our categories.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" asChild>
            <Link href="/posts">Browse All Posts</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {posts.length} of {total} results
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          <Button
            variant="outline"
            asChild
            disabled={!hasPrevPage}
          >
            {hasPrevPage ? (
              <Link href={buildUrl(currentPage - 1)}>
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  asChild={page !== currentPage}
                >
                  {page === currentPage ? (
                    <span>{page}</span>
                  ) : (
                    <Link href={buildUrl(page)}>
                      {page}
                    </Link>
                  )}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            asChild
            disabled={!hasNextPage}
          >
            {hasNextPage ? (
              <Link href={buildUrl(currentPage + 1)}>
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
    </div>
  );
}
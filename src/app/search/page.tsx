import { Metadata } from 'next';
import { searchPosts, getCategories, getTags } from '@/lib/blog';
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchInput } from '@/components/search/search-input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  
  return {
    title: query ? `Search: ${query} - DevBlog` : 'Search - DevBlog',
    description: query 
      ? `Search results for "${query}" on DevBlog`
      : 'Search for posts about web development, programming, and technology.',
    robots: 'noindex', // Don't index search result pages
  };
}

const POSTS_PER_PAGE = 12;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const categoryFilter = params.category || '';
  const tagFilter = params.tag || '';
  const currentPage = Number(params.page) || 1;
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // Get search results
  const { posts, total } = query 
    ? await searchPosts(query, POSTS_PER_PAGE, offset)
    : { posts: [], total: 0 };

  // Get filter data
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags()
  ]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {query ? `Search: "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-muted-foreground mt-2">
              {total} {total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <SearchInput 
          placeholder="Search posts..." 
          className="max-w-2xl"
          autoFocus={!query}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <SearchFilters
            categories={categories}
            tags={tags}
            selectedCategory={categoryFilter}
            selectedTag={tagFilter}
            currentQuery={query}
          />
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          <SearchResults
            posts={posts}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            query={query}
            searchParams={params}
          />
        </div>
      </div>
    </div>
  );
}
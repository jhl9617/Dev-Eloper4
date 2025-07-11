import { Metadata } from 'next';
import { getCategories } from '@/lib/blog';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Folder, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Categories - DevBlog',
  description: 'Browse posts by category to find content that interests you.',
  openGraph: {
    title: 'Categories - DevBlog',
    description: 'Browse posts by category to find content that interests you.',
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const supabase = createClient();

  // Get post counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')
        .is('deleted_at', null);

      return {
        ...category,
        postCount: count || 0,
      };
    })
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Categories
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse posts by category to find content that interests you
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Categories Grid */}
      {categoriesWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground max-w-sm">
            Categories will appear here once posts are organized into different topics.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoriesWithCounts.map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <Link href={`/categories/${category.slug}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Folder className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{category.postCount}</span>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    {category.postCount === 0 
                      ? 'No posts yet' 
                      : `${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}`
                    }
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
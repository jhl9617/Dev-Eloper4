"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import type { CategoryWithStats, TagWithStats } from '@/lib/blog';
import { getTranslatedCategoryName, getTranslatedCategoryDescription, getTranslatedTagName } from '@/lib/translations';

export default function SearchPage() {
  const t = useTranslations();
  const tSearch = useTranslations('search');
  const tCategories = useTranslations('categories');
  const tCategoryDescriptions = useTranslations('categoryDescriptions');
  const tTags = useTranslations('tags');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [popularCategories, setPopularCategories] = useState<CategoryWithStats[]>([]);
  const [trendingTags, setTrendingTags] = useState<TagWithStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch categories with stats
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          *,
          posts!inner(id)
        `)
        .is('deleted_at', null)
        .eq('posts.status', 'published')
        .is('posts.deleted_at', null)
        .limit(6);

      if (categoriesData) {
        const categoryStats = new Map<string, number>();
        categoriesData.forEach(item => {
          const count = categoryStats.get(item.id.toString()) || 0;
          categoryStats.set(item.id.toString(), count + 1);
        });

        const uniqueCategories = new Map();
        categoriesData.forEach(item => {
          if (!uniqueCategories.has(item.id)) {
            uniqueCategories.set(item.id, {
              ...item,
              post_count: categoryStats.get(item.id.toString()) || 0
            });
          }
        });

        const sortedCategories = Array.from(uniqueCategories.values())
          .sort((a: any, b: any) => b.post_count - a.post_count)
          .slice(0, 6);
        
        setPopularCategories(sortedCategories);
      }

      // Fetch trending tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select(`
          *,
          post_tags!inner(
            posts!inner(id)
          )
        `)
        .is('deleted_at', null)
        .eq('post_tags.posts.status', 'published')
        .is('post_tags.posts.deleted_at', null)
        .limit(8);

      if (tagsData) {
        const tagStats = new Map<string, number>();
        tagsData.forEach(item => {
          const count = tagStats.get(item.id.toString()) || 0;
          tagStats.set(item.id.toString(), count + 1);
        });

        const uniqueTags = new Map();
        tagsData.forEach(item => {
          if (!uniqueTags.has(item.id)) {
            uniqueTags.set(item.id, {
              ...item,
              post_count: tagStats.get(item.id.toString()) || 0
            });
          }
        });

        const sortedTags = Array.from(uniqueTags.values())
          .sort((a: any, b: any) => b.post_count - a.post_count)
          .slice(0, 8);
        
        setTrendingTags(sortedTags);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // TODO: Implement actual search functionality
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('navigation.search')}
          </h1>
          <p className="text-xl text-muted-foreground">
            Find articles, tutorials, and insights
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={tSearch('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? 'Searching...' : t('navigation.search')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {tSearch('searchResults')}
              </h2>
              <span className="text-muted-foreground">
                {tSearch('foundResults', { count: 0 })}
              </span>
            </div>

            {/* No Results */}
            <Card>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {tSearch('noResults')} &quot;{searchQuery}&quot;
                    </h3>
                    <p className="text-muted-foreground">
                      Try different keywords or browse our categories
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popular Categories */}
        {!searchQuery && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{tSearch('popularCategories')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {getTranslatedCategoryName(category.slug, tCategories, category.name)}
                        </CardTitle>
                        <Badge variant="secondary">{category.post_count}</Badge>
                      </div>
                      <CardDescription>
                        {getTranslatedCategoryDescription(category.slug, tCategoryDescriptions, `Explore articles about ${category.name.toLowerCase()}`)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{tSearch('trendingTopics')}</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent"
                  >
                    {getTranslatedTagName(tag.slug, tTags, tag.name)} ({tag.post_count})
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
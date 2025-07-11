'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter, Folder, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface TagType {
  id: number;
  name: string;
  slug: string;
}

interface SearchFiltersProps {
  categories: Category[];
  tags: TagType[];
  selectedCategory: string;
  selectedTag: string;
  currentQuery: string;
}

export function SearchFilters({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  currentQuery,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filters change
    params.delete('page');
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (currentQuery) {
      params.set('q', currentQuery);
    }
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategory || selectedTag;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  <Folder className="h-3 w-3" />
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('category', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tags.find(t => t.slug === selectedTag)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('tag', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
            <Separator />
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Categories
            </h4>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilter('category', 
                    selectedCategory === category.slug ? '' : category.slug
                  )}
                  className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted transition-colors ${
                    selectedCategory === category.slug ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 20).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => updateFilter('tag', 
                    selectedTag === tag.slug ? '' : tag.slug
                  )}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    selectedTag === tag.slug 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
              {tags.length > 20 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{tags.length - 20} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>
            Use filters to narrow down your search results by category or tag.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
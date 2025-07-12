"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SearchPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
                  placeholder={t('search.searchPlaceholder')}
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
                {t('search.searchResults')}
              </h2>
              <span className="text-muted-foreground">
                {t('search.foundResults', { count: 0 })}
              </span>
            </div>

            {/* No Results */}
            <Card>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t('search.noResults')} &quot;{searchQuery}&quot;
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
            <h2 className="text-2xl font-semibold">Popular Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Frontend', count: 15, description: 'React, Vue, Angular' },
                { name: 'Backend', count: 12, description: 'Node.js, Python, Java' },
                { name: 'DevOps', count: 8, description: 'Docker, Kubernetes, CI/CD' },
                { name: 'Database', count: 6, description: 'SQL, NoSQL, Redis' },
                { name: 'Mobile', count: 9, description: 'React Native, Flutter' },
                { name: 'AI/ML', count: 7, description: 'TensorFlow, PyTorch' }
              ].map((category) => (
                <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js 15',
                'React 19',
                'TypeScript',
                'Tailwind CSS',
                'Supabase',
                'Vercel',
                'Docker',
                'Kubernetes'
              ].map((topic) => (
                <Badge 
                  key={topic} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSearchQuery(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
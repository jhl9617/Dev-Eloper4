'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { searchPosts } from '@/lib/blog';
import { useDebounce } from 'react-use';
import type { PostWithRelations } from '@/lib/blog';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({ 
  placeholder = "Search posts...", 
  className = "",
  autoFocus = false 
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useDebounce(
    async () => {
      if (query.trim() && query.length >= 2) {
        setLoading(true);
        try {
          const { posts } = await searchPosts(query, 5); // Limit to 5 results for dropdown
          setResults(posts);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    },
    300,
    [query]
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));

    // Navigate to search page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden" ref={dropdownRef}>
          <CardContent className="p-0">
            {/* Loading */}
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {/* Search Results */}
            {!loading && query.length >= 2 && results.length > 0 && (
              <div>
                <div className="p-3 border-b bg-muted/50">
                  <h4 className="font-medium text-sm">Search Results</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {results.map((post: any) => (
                    <button
                      key={post.id}
                      className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        router.push(`/posts/${post.slug}`);
                        setIsOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className="font-medium text-sm line-clamp-1">{post.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.content.replace(/[#*`]/g, '').slice(0, 100)}...
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.category.name}
                          </Badge>
                        )}
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t bg-muted/25">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleSearch(query)}
                  >
                    <Search className="mr-2 h-3 w-3" />
                    View all results for &quot;{query}&quot;
                  </Button>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {/* Recent Searches */}
            {!loading && query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-1"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                      onClick={() => handleSearch(search)}
                    >
                      <div className="text-sm flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {search}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils/slug';
import { PostDeleteButton } from '@/components/admin/post-delete-button';
import type { Database } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface PostWithRelations extends Post {
  category?: Category | null;
  post_tags?: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user && isAdmin) {
      loadPosts();
    }
  }, [user, isAdmin]);

  const loadPosts = async () => {
    try {
      // Get all posts with relations
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories(*),
          post_tags(tag:tags(*))
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Debug Info:</p>
            <p className="text-sm">User: {user?.email || 'Not logged in'}</p>
            <p className="text-sm">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Get started by creating your first blog post.
              </p>
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(post.status)}
                      >
                        {getStatusText(post.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {formatDate(post.created_at)}</span>
                      {post.published_at && (
                        <span>Published: {formatDate(post.published_at)}</span>
                      )}
                      {post.category && (
                        <span>Category: {post.category.name}</span>
                      )}
                    </div>
                    
                    {post.post_tags && post.post_tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {post.post_tags.map(({ tag }) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'published' && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <PostDeleteButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              </CardHeader>
              
              {post.content && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.content.replace(/[#*`]/g, '').slice(0, 200)}...
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
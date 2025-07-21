'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, Settings, Loader2, BarChart3, MessageCircle } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { RecentComments } from '@/components/admin/recent-comments';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    loading: true
  });
  
  const { user, isAdmin, loading } = useAuth();
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    try {
      // Get some basic stats
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      const { count: publishedPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null);

      const { count: draftPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
        .is('deleted_at', null);

      setStats({
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        draftPosts: draftPosts || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadStats();
    }
  }, [user, isAdmin, loadStats]);

  if (loading) {
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
          <p className="text-muted-foreground mb-4">You don&apos;t have permission to access this page.</p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Debug Info:</p>
            <p className="text-sm">User: {user?.email || 'Not logged in'}</p>
            <p className="text-sm">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
            <p className="text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your blog content and settings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        </div>
        <AnalyticsDashboard />
      </div>

      {/* Recent Comments Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <RecentComments limit={5} showViewAll={true} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/posts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Manage Posts
              </CardTitle>
              <CardDescription>
                View, edit, and manage all your blog posts
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/posts/new">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Post
              </CardTitle>
              <CardDescription>
                Write and publish a new blog post
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/comments">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Manage Comments
              </CardTitle>
              <CardDescription>
                Monitor and moderate all user comments
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/categories">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Categories & Tags
              </CardTitle>
              <CardDescription>
                Organize your content with categories and tags
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminCheck } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.user.id)
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analytics data
    const [
      totalPostsResult,
      publishedPostsResult,
      totalViewsResult,
      totalCommentsResult,
      popularPostsResult,
      recentViewsResult,
      categoryStatsResult,
    ] = await Promise.all([
      // Total posts
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),

      // Published posts
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null),

      // Total views
      supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true }),

      // Total comments
      supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),

      // Popular posts (most viewed)
      supabase
        .from('post_views')
        .select(`
          post_id,
          posts!inner(
            id,
            title,
            slug,
            created_at
          )
        `)
        .limit(5),

      // Views in last 7 days
      supabase
        .from('post_views')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Category stats
      supabase
        .from('posts')
        .select(`
          category_id,
          categories!inner(
            id,
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .is('deleted_at', null),
    ]);

    // Process popular posts data
    const popularPostsMap = new Map<string, any>();
    popularPostsResult.data?.forEach((view: any) => {
      const postId = view.post_id;
      if (!popularPostsMap.has(postId)) {
        popularPostsMap.set(postId, {
          ...view.posts,
          viewCount: 0,
        });
      }
      popularPostsMap.get(postId).viewCount += 1;
    });

    const popularPosts = Array.from(popularPostsMap.values())
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);

    // Process recent views for chart data
    const viewsByDay = new Map<string, number>();
    recentViewsResult.data?.forEach((view: any) => {
      const day = new Date(view.created_at).toISOString().split('T')[0];
      viewsByDay.set(day, (viewsByDay.get(day) || 0) + 1);
    });

    const chartData = Array.from(viewsByDay.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process category stats
    const categoryMap = new Map<string, any>();
    categoryStatsResult.data?.forEach((post: any) => {
      if (post.categories) {
        const categoryId = post.categories.id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            ...post.categories,
            postCount: 0,
          });
        }
        categoryMap.get(categoryId).postCount += 1;
      }
    });

    const categoryStats = Array.from(categoryMap.values())
      .sort((a, b) => b.postCount - a.postCount);

    const analytics = {
      overview: {
        totalPosts: totalPostsResult.count || 0,
        publishedPosts: publishedPostsResult.count || 0,
        totalViews: totalViewsResult.count || 0,
        totalComments: totalCommentsResult.count || 0,
      },
      popularPosts,
      chartData,
      categoryStats,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
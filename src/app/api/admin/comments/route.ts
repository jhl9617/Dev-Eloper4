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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, post

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query for comments with post information and parent comment info
    let query = supabase
      .from('comments')
      .select(`
        *,
        posts!inner (
          id,
          title,
          slug
        ),
        parent_comment:parent_id (
          id,
          content,
          author_name
        ),
        reactions:comment_reactions (
          reaction_type
        )
      `)
      .is('deleted_at', null);

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'post':
        query = query.order('post_id', { ascending: true }).order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Apply pagination
    const { data: comments, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Process comments to include reaction counts
    const processedComments = comments?.map(comment => {
      const reactions = comment.reactions || [];
      const reactionCounts = reactions.reduce((acc: any, reaction: any) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {});

      return {
        ...comment,
        reactions: undefined, // Remove the raw reactions array
        reactionCounts: {
          like: reactionCounts.like || 0,
          dislike: reactionCounts.dislike || 0,
          total: reactions.length
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      comments: processedComments || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get comment ID from request body
    const { commentId } = await request.json();
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the comment (set deleted_at timestamp)
    const { error } = await supabase
      .from('comments')
      .update({ 
        deleted_at: new Date().toISOString(),
        content: '[삭제된 댓글입니다]'
      })
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
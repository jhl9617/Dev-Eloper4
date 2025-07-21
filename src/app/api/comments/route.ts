import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { 
  grantCommentDeletionRights, 
  getUserDeletableComments,
  cleanupExpiredSessions 
} from '@/lib/session';
import { hashIpAddress } from '@/lib/ip-hash';

// Rate limiting helper
async function checkRateLimit(hashedIp: string, supabase: any) {
  const now = new Date();
  
  // Get or create rate limit record
  const { data: rateLimitData, error: rateLimitError } = await supabase
    .from('comment_rate_limits')
    .select('*')
    .eq('ip_address', hashedIp)
    .single();
  
  if (rateLimitError && rateLimitError.code !== 'PGRST116') {
    throw new Error('Rate limit check failed');
  }
  
  if (!rateLimitData) {
    // First comment from this IP
    await supabase
      .from('comment_rate_limits')
      .insert({
        ip_address: hashedIp,
        comment_count: 1,
        last_comment_at: now.toISOString(),
        reset_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      });
    return true;
  }
  
  // Check if reset time has passed
  if (now > new Date(rateLimitData.reset_time)) {
    // Reset the counter
    await supabase
      .from('comment_rate_limits')
      .update({
        comment_count: 1,
        last_comment_at: now.toISOString(),
        reset_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      })
      .eq('ip_address', hashedIp);
    return true;
  }
  
  // Check if under limit (5 comments per hour)
  if (rateLimitData.comment_count >= 5) {
    return false;
  }
  
  // Update counter
  await supabase
    .from('comment_rate_limits')
    .update({
      comment_count: rateLimitData.comment_count + 1,
      last_comment_at: now.toISOString(),
    })
    .eq('ip_address', hashedIp);
    
  return true;
}

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get parent comments with pagination
    const { data: parentComments, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .is('deleted_at', null)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Get all replies for the parent comments
    const parentIds = parentComments?.map(comment => comment.id) || [];
    let replies = [];
    
    if (parentIds.length > 0) {
      const { data: repliesData, error: repliesError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .in('parent_id', parentIds)
        .order('created_at', { ascending: true }); // Replies in chronological order
      
      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        replies = [];
      } else {
        replies = repliesData || [];
      }
    }

    // Organize comments into hierarchy
    const comments = (parentComments || []).map(parentComment => ({
      ...parentComment,
      replies: replies.filter(reply => reply.parent_id === parentComment.id)
    }));

    // Get user's deletable comments
    const userDeletableComments = await getUserDeletableComments(postId);
    
    // Clean up expired sessions (optional, can be done periodically)
    await cleanupExpiredSessions();
    
    return NextResponse.json({
      comments: comments || [],
      userDeletableComments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const { postId, content, authorName, captchaSessionId, captchaAnswer, parentId } = await request.json();
    
    // Validation
    if (!postId || !content || !authorName || !captchaSessionId || captchaAnswer === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Verify CAPTCHA
    const cookieStore = await cookies();
    const storedData = cookieStore.get(`captcha_${captchaSessionId}`);
    
    if (!storedData) {
      return NextResponse.json(
        { error: 'CAPTCHA session not found or expired' },
        { status: 400 }
      );
    }
    
    const { answer, expires, verified } = JSON.parse(storedData.value);
    
    if (Date.now() > expires) {
      cookieStore.delete(`captcha_${captchaSessionId}`);
      return NextResponse.json(
        { error: 'CAPTCHA session expired' },
        { status: 400 }
      );
    }
    
    // Check if CAPTCHA was verified
    if (!verified) {
      return NextResponse.json(
        { error: 'CAPTCHA not verified. Please solve the math problem first.' },
        { status: 400 }
      );
    }
    
    if (parseInt(captchaAnswer) !== answer) {
      return NextResponse.json(
        { error: 'Incorrect CAPTCHA answer' },
        { status: 400 }
      );
    }
    
    // Clean up CAPTCHA cookie
    cookieStore.delete(`captcha_${captchaSessionId}`);
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const hashedIp = hashIpAddress(ip);
    
    const supabase = await createClient();
    
    // Check rate limit
    const canPost = await checkRateLimit(hashedIp, supabase);
    if (!canPost) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting again.' },
        { status: 429 }
      );
    }
    
    // Validate content length
    if (content.length < 5 || content.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be between 5 and 500 characters' },
        { status: 400 }
      );
    }
    
    // Validate author name length
    if (authorName.length < 2 || authorName.length > 30) {
      return NextResponse.json(
        { error: 'Author name must be between 2 and 30 characters' },
        { status: 400 }
      );
    }
    
    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();
    
    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .eq('post_id', postId)
        .is('deleted_at', null)
        .single();
      
      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 400 }
        );
      }
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content: content.trim(),
        author_name: authorName.trim(),
        ip_address: hashedIp,
        parent_id: parentId || null,
      })
      .select()
      .single();
    
    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Grant deletion rights to the user who created the comment
    try {
      await grantCommentDeletionRights(comment.id);
    } catch (error) {
      console.error('Error granting deletion rights:', error);
      // This is not a fatal error, comment was created successfully
    }
    
    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
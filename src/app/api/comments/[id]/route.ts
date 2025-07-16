import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canDeleteComment, revokeCommentDeletionRights } from '@/lib/session';

// DELETE - Soft delete a comment (admin or user within 30 min)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    
    if (user) {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      isAdmin = !!adminData;
    }

    // Check if user can delete this comment (admin or within 30 min window)
    const canDelete = isAdmin || await canDeleteComment(id);
    
    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }
    
    // Soft delete comment
    const { error: deleteError } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    // Revoke deletion rights (cleanup)
    try {
      await revokeCommentDeletionRights(id);
    } catch (error) {
      console.error('Error revoking deletion rights:', error);
      // This is not a fatal error, comment was deleted successfully
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
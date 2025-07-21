import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    // Get reaction counts for the comment
    const { data: reactions, error } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId);

    if (error) {
      throw error;
    }

    // Count reactions by type
    const reactionCounts = reactions?.reduce((acc, reaction) => {
      acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      commentId,
      reactions: {
        like: reactionCounts.like || 0,
        dislike: reactionCounts.dislike || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();
    const { reactionType } = await request.json();

    // Validate reaction type
    if (!['like', 'dislike'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Get IP address
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || '127.0.0.1';

    // Check if user already reacted to this comment
    const { data: existingReaction, error: checkError } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)
      .eq('ip_address', ip)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.reaction_type === reactionType) {
        const { error: deleteError } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          throw deleteError;
        }

        return NextResponse.json({
          success: true,
          message: 'Reaction removed',
          action: 'removed',
        });
      } else {
        // If different reaction, update it
        const { error: updateError } = await supabase
          .from('comment_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);

        if (updateError) {
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: 'Reaction updated',
          action: 'updated',
        });
      }
    } else {
      // Create new reaction
      const { error: insertError } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          ip_address: ip,
          reaction_type: reactionType,
        });

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({
        success: true,
        message: 'Reaction added',
        action: 'added',
      });
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    // Get IP address
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || '127.0.0.1';

    // Delete user's reaction
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('ip_address', ip);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Reaction removed',
    });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete reaction' },
      { status: 500 }
    );
  }
}
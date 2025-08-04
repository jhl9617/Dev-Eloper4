import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/tags - Get all tags
export async function GET() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Use service role client to bypass RLS for data fetching
    const serviceSupabase = createServiceRoleClient();
    
    // Get tags with post count
    const { data: tags, error } = await serviceSupabase
      .from('tags')
      .select(`
        *,
        post_tags(count)
      `)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform data to include counts
    const transformedTags = tags?.map(tag => ({
      ...tag,
      _count: {
        posts: tag.post_tags?.length || 0
      }
    })) || [];

    return NextResponse.json(transformedTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST /api/admin/tags - Create new tag
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient();

    // Check if slug already exists
    const { data: existingTag } = await serviceSupabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (existingTag) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Create tag
    const { data: tag, error } = await serviceSupabase
      .from('tags')
      .insert([{ name, slug }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/categories - Get all categories
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
    
    // Get categories with post count
    const { data: categories, error } = await serviceSupabase
      .from('categories')
      .select(`
        *,
        posts(count)
      `)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform data to include counts
    const transformedCategories = categories?.map(cat => ({
      ...cat,
      _count: {
        posts: cat.posts?.length || 0
      }
    })) || [];

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new category
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
    const { data: existingCategory } = await serviceSupabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (existingCategory) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Create category
    const { data: category, error } = await serviceSupabase
      .from('categories')
      .insert([{ name, slug }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
#!/usr/bin/env node

/**
 * Supabase Storage 설정 테스트 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('🔍 Testing Supabase Storage Configuration...\n');
  
  try {
    // Test 1: List buckets
    console.log('1. Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
      return;
    }
    
    console.log('✅ Successfully connected to Storage');
    console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
    
    // Test 2: Check if 'images' bucket exists
    console.log('\n2. Checking images bucket...');
    const imagesBucket = buckets.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      console.error('❌ "images" bucket not found');
      console.log('📋 Please create the "images" bucket in Supabase dashboard:');
      console.log('   1. Go to Storage section');
      console.log('   2. Click "Create bucket"');
      console.log('   3. Name: images');
      console.log('   4. Public bucket: ✅ (checked)');
      return;
    }
    
    console.log('✅ "images" bucket found');
    console.log('   Public:', imagesBucket.public);
    console.log('   Created:', imagesBucket.created_at);
    
    // Test 3: Test file listing (should work even with empty bucket)
    console.log('\n3. Testing bucket permissions...');
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('posts', {
        limit: 1,
        offset: 0
      });
    
    if (filesError) {
      console.error('❌ Failed to access bucket contents:', filesError.message);
      console.log('📋 Please run the SQL script to set up storage policies:');
      console.log('   File: docs/setup-storage.sql');
      return;
    }
    
    console.log('✅ Bucket access permissions working');
    console.log('   Files in posts folder:', files.length);
    
    // Test 4: Test authentication for upload (requires login)
    console.log('\n4. Testing authentication requirement...');
    console.log('ℹ️  Upload test requires admin login');
    console.log('   This will be tested through the web interface');
    
    console.log('\n🎉 Storage configuration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Login as admin in the web interface');
    console.log('2. Go to /admin/posts/new');
    console.log('3. Try uploading an image in the Cover Image section');
    console.log('4. Verify the image uploads successfully');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Supabase project is active');
    console.log('3. Check environment variables in .env.local');
  }
}

// Run the test
testStorage().then(() => {
  console.log('\n✨ Storage test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
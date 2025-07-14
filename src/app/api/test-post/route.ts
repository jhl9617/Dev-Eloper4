import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "test";

    console.log(`Attempting to fetch post with slug: ${slug}`);

    const post = await getPostBySlug(slug);

    if (!post) {
      console.log(`Post not found for slug: ${slug}`);
      return NextResponse.json(
        { error: "Post not found", slug },
        { status: 404 }
      );
    }

    console.log(`Successfully fetched post: ${post.title}`);

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        published_at: post.published_at,
        category: post.category?.name,
        tags_count: post.tags?.length || 0,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

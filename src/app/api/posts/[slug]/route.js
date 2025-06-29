import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { recordView, getViewCount } from "@/lib/cache";
import "@/lib/autoStart"; // Auto-start batch processor

// GET SINGLE POST - Optimized for 10k+ users
export const GET = async (req, { params }) => {
  const { slug } = params;

  try {
    // Get post WITHOUT updating views (prevents database overload)
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!post) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found!" }, { status: 404 })
      );
    }

    // Record view in Redis for batch processing (non-blocking)
    recordView(slug).catch(err => console.error('View recording failed:', err));
    
    // Get current view count from Redis to show real-time views
    const additionalViews = await getViewCount(slug);
    
    // Return post with updated view count
    const postWithViews = {
      ...post,
      views: post.views + additionalViews
    };

    return new NextResponse(JSON.stringify(postWithViews), { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};
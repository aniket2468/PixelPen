import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }), 
      { status: 401 }
    );
  }

  try {
    const userEmail = session.user.email;

    // Get user info for member since date
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true,
        emailVerified: true 
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found!" }), 
        { status: 404 }
      );
    }

    // Get total posts count
    const totalPosts = await prisma.post.count({
      where: { userEmail: userEmail }
    });

    // Get total comments count
    const totalComments = await prisma.comment.count({
      where: { userEmail: userEmail }
    });

    // Get total views for all user's posts
    const postsWithViews = await prisma.post.findMany({
      where: { userEmail: userEmail },
      select: { views: true }
    });

    const totalViews = postsWithViews.reduce((sum, post) => sum + post.views, 0);

    // Get the earliest post creation date as member since (fallback to emailVerified)
    const earliestPost = await prisma.post.findFirst({
      where: { userEmail: userEmail },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });

    const memberSince = earliestPost 
      ? earliestPost.createdAt 
      : user.emailVerified || new Date();

    const stats = {
      totalPosts,
      totalComments,
      totalViews,
      memberSince
    };

    return new NextResponse(
      JSON.stringify(stats), 
      { status: 200 }
    );
  } catch (err) {
    console.error('User stats error:', err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }), 
      { status: 500 }
    );
  }
}; 
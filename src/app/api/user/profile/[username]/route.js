import prisma from '@/utils/connect';
import { NextResponse } from 'next/server';

export const GET = async (req, { params }) => {
  try {
    const { username } = params;

    if (!username) {
      return new NextResponse(
        JSON.stringify({ message: "Username is required!" }), 
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { 
        username: username 
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        _count: {
          select: {
            Post: true,
            Comment: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found!" }), 
        { status: 404 }
      );
    }

    // Get user stats
    const posts = await prisma.post.findMany({
      where: { userEmail: user.email },
      select: {
        views: true,
        createdAt: true
      }
    });

    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const memberSince = user.id ? await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true }
    }).then(async (u) => {
      // Get the user creation date from the database
      // Since we don't store createdAt in user table, we'll use the earliest post or account creation
      const firstPost = await prisma.post.findFirst({
        where: { userEmail: user.email },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      });
      
      const account = await prisma.account.findFirst({
        where: { userId: user.id },
        select: { userId: true }
      });
      
      // Use a reasonable fallback date if no posts exist
      return firstPost?.createdAt || new Date('2024-01-01');
    }) : new Date();

    // Get recent posts (limit 5)
    const recentPosts = await prisma.post.findMany({
      where: { userEmail: user.email },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        desc: true,
        img: true,
        views: true,
        createdAt: true,
        catSlug: true
      }
    });

    const userStats = {
      totalPosts: user._count.Post,
      totalComments: user._count.Comment,
      totalViews,
      memberSince
    };

    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          image: user.image
        },
        stats: userStats,
        recentPosts
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Profile fetch error:', err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }), 
      { status: 500 }
    );
  }
}; 
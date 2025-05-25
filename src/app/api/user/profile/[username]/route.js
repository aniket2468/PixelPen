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
        createdAt: true,
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
    
    // Use the user's actual creation date
    const memberSince = user.createdAt || new Date();

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
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        emailVerified: true
      }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found!" }), 
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify(user), 
      { status: 200 }
    );
  } catch (err) {
    console.error('User fetch error:', err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }), 
      { status: 500 }
    );
  }
}; 
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { getCachedData, clearCache } from "@/lib/cache";

// GET ALL COMMENTS OF A POST - Optimized with caching and pagination
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  if (!postSlug) {
    return new NextResponse(
      JSON.stringify({ message: "Post slug is required!" }, { status: 400 })
    );
  }

  try {
    const cacheKey = `comments:${postSlug}:page-${page}:limit-${limit}`;
    const result = await getCachedData(
      cacheKey,
      async () => {
        const [comments, totalCount] = await prisma.$transaction([
          prisma.comment.findMany({
            where: { postSlug },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.comment.count({
            where: { postSlug }
          })
        ]);

        return {
          comments,
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount
        };
      },
      120 // Cache for 2 minutes (comments change more frequently)
    );

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};

// CREATE A COMMENT - Clear cache after creation
export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }, { status: 401 })
    );
  }

  try {
    const body = await req.json();
    const comment = await prisma.comment.create({
      data: { ...body, userEmail: session.user.email },
      include: { user: true }, // Include user data in response
    });

    // Clear comments cache for this post when new comment is added
    if (body.postSlug) {
      clearCache(`comments:${body.postSlug}:*`).catch(err => 
        console.error('Failed to clear comments cache:', err)
      );
    }

    return new NextResponse(JSON.stringify(comment), { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};
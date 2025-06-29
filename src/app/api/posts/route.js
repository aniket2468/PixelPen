import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/cache";

// Fetch paginated posts - Optimized for 10k+ users with caching
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page")) || 1;
  const cat = searchParams.get("cat") || "";
  const type = searchParams.get("type") || "";

  const POST_PER_PAGE = 3;

  try {
    if (type === "most-viewed") {
      const cacheKey = `posts:most-viewed:${POST_PER_PAGE}`;
      const posts = await getCachedData(
        cacheKey,
        async () => {
          return await prisma.post.findMany({
            orderBy: { views: "desc" },
            take: POST_PER_PAGE,
            include: { user: true }
          });
        },
        300 // Cache for 5 minutes
      );
      return NextResponse.json(posts, { status: 200 });
    } else if (type === "random") {
      const cacheKey = `posts:random:page-${page}:${POST_PER_PAGE}`;
      const posts = await getCachedData(
        cacheKey,
        async () => {
          return await prisma.post.findMany({
            where: { img: { not: "" } },
            orderBy: { createdAt: "desc" },
            take: POST_PER_PAGE,
            skip: (page - 1) * POST_PER_PAGE,
            include: { user: true }
          });
        },
        180 // Cache for 3 minutes (shorter for pagination)
      );
      return NextResponse.json(posts, { status: 200 });
    } else {
      const cacheKey = `posts:list:page-${page}:cat-${cat}:${POST_PER_PAGE}`;
      const result = await getCachedData(
        cacheKey,
        async () => {
          const query = {
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1),
            where: {
              ...(cat && { catSlug: cat }),
            },
            orderBy: { createdAt: "desc" },
            include: { user: true }
          };

          const [posts, count] = await prisma.$transaction([
            prisma.post.findMany(query),
            prisma.post.count({ where: query.where }),
          ]);
          return { posts, count };
        },
        180 // Cache for 3 minutes
      );
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

// Create a new post
export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ message: "Not Authenticated!" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const post = await prisma.post.create({
      data: { ...body, userEmail: session.user.email },
      include: { user: true }
    });

    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

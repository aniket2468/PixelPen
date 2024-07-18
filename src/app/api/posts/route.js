import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

// Fetch paginated posts
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || 1;
  const cat = searchParams.get("cat");
  const type = searchParams.get("type");

  const POST_PER_PAGE = 3;

  try {
    if (type === "most-viewed") {
      const posts = await prisma.post.findMany({
        orderBy: { views: "desc" },
        take: POST_PER_PAGE,
        include: { user: true }
      });
      return NextResponse.json(posts, { status: 200 });
    } else if (type === "random") {
      const posts = await prisma.post.findMany({
        where: { img: { not: "" } },
        orderBy: { createdAt: "desc" },
        take: POST_PER_PAGE,
        skip: (page - 1) * POST_PER_PAGE,
        include: { user: true }
      });
      return NextResponse.json(posts, { status: 200 });
    } else {
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
      return NextResponse.json({ posts, count }, { status: 200 });
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

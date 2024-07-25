import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page")) || 1;
  const POST_PER_PAGE = 4;

  if (!query) {
    return NextResponse.json({ message: "No search query provided." }, { status: 400 });
  }

  const decodedQuery = decodeURIComponent(query);
  const queryWords = decodedQuery.split(' ');

  try {
    const [posts, count] = await prisma.$transaction([
      prisma.post.findMany({
        where: {
          OR: queryWords.map(word => ({
            OR: [
              {
                title: {
                  contains: word,
                  mode: "insensitive",
                },
              },
              {
                desc: {
                  contains: word,
                  mode: "insensitive",
                },
              },
              {
                catSlug: {
                  contains: word,
                  mode: "insensitive",
                },
              },
            ]
          }))
        },
        include: {
          user: true,
        },
        skip: (page - 1) * POST_PER_PAGE,
        take: POST_PER_PAGE,
      }),
      prisma.post.count({
        where: {
          OR: queryWords.map(word => ({
            OR: [
              {
                title: {
                  contains: word,
                  mode: "insensitive",
                },
              },
              {
                desc: {
                  contains: word,
                  mode: "insensitive",
                },
              },
              {
                catSlug: {
                  contains: word,
                  mode: "insensitive",
                },
              },
            ]
          }))
        }
      })
    ]);

    return NextResponse.json({ posts, count }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

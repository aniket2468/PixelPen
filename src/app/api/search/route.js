import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ message: "No search query provided." }, { status: 400 });
  }

  const decodedQuery = decodeURIComponent(query);
  const queryWords = decodedQuery.split(' ');

  try {
    const posts = await prisma.post.findMany({
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
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

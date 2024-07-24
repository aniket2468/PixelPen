import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ message: "No search query provided." }, { status: 400 });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            desc: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            catSlug: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
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

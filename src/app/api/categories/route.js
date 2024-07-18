import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        Posts: {
          select: {
            views: true,
          },
        },
      },
    });

    const categoriesWithViews = categories.map(category => {
      const totalViews = category.Posts.reduce((acc, post) => acc + post.views, 0);
      return {
        ...category,
        totalViews,
      };
    });

    const sortedCategories = categoriesWithViews.sort((a, b) => b.totalViews - a.totalViews);
    const topCategories = sortedCategories.slice(0, 6);

    return NextResponse.json(topCategories, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

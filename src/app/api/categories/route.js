import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getCachedData } from "@/lib/cache";

export const GET = async () => {
  try {
    const topCategories = await getCachedData(
      'categories:top-6',
      async () => {
        // Optimized query - get categories with post counts instead of loading all posts
        const categories = await prisma.category.findMany({
          select: {
            id: true,
            slug: true,
            title: true,
            img: true,
            _count: {
              select: {
                Posts: true
              }
            }
          }
        });

        // For categories with posts, get total views more efficiently
        const categoriesWithViews = await Promise.all(
          categories.map(async (category) => {
            if (category._count.Posts > 0) {
              const totalViews = await prisma.post.aggregate({
                where: { catSlug: category.slug },
                _sum: { views: true }
              });
              
              return {
                ...category,
                totalViews: totalViews._sum.views || 0,
              };
            } else {
              return {
                ...category,
                totalViews: 0,
              };
            }
          })
        );

        const sortedCategories = categoriesWithViews.sort((a, b) => b.totalViews - a.totalViews);
        return sortedCategories.slice(0, 6);
      },
      600 // Cache for 10 minutes (categories change less frequently)
    );

    return NextResponse.json(topCategories, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

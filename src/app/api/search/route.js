import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { searchWithBM25, getSearchSuggestions } from "@/utils/search";
import { getCachedData } from "@/lib/cache";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const suggestions = searchParams.get("suggestions") === "true";

  if (!query) {
    return NextResponse.json({ message: "No search query provided." }, { status: 400 });
  }

  const decodedQuery = decodeURIComponent(query).trim();

  try {
    // Get all posts for BM25 calculation (with caching)
    const cacheKey = `search:all-posts:${Date.now() - (Date.now() % 300000)}`; // Cache for 5 minutes
    const allPosts = await getCachedData(
      cacheKey,
      async () => {
        return await prisma.post.findMany({
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      300 // Cache for 5 minutes
    );

    // Handle suggestions request
    if (suggestions) {
      const searchSuggestions = getSearchSuggestions(allPosts, decodedQuery, 5);
      return NextResponse.json({ suggestions: searchSuggestions }, { status: 200 });
    }

    // Use BM25 search algorithm
    const searchResults = searchWithBM25(allPosts, decodedQuery, {
      k1: 1.2,
      b: 0.75,
      minScore: 0.1,
      maxResults: 1000 // Get all relevant results
    });

    // Remove search-specific fields from results
    const cleanedPosts = searchResults.map(post => {
      const { tokens, searchText, score, ...cleanPost } = post;
      return {
        ...cleanPost,
        relevanceScore: score // Keep score for debugging/analytics
      };
    });

    return NextResponse.json({ 
      posts: cleanedPosts, 
      count: searchResults.length,
      totalResults: searchResults.length
    }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
};

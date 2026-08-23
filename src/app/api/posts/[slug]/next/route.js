import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import { resolveNextArticle } from "@/utils/learningNext";
import { getCachedData } from "@/lib/cache";

/**
 * GET /api/posts/[slug]/next
 * Hybrid next article: explicit → BM25 → category (Decision C).
 * Personalizes via UserPostProgress when signed in (Decision Q4=C).
 * Anonymous responses may be cached briefly (Redis optional).
 */
export const GET = async (req, { params }) => {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ message: "Slug is required" }, { status: 400 });
  }

  try {
    const session = await getAuthSession();
    const userEmail = session?.user?.email || null;

    const load = async () => {
      const result = await resolveNextArticle(slug, userEmail);

      if (result.error === "not_found") {
        return { __status: 404, message: "Post not found" };
      }

      if (!result.post?.slug || !result.post?.title) {
        return { post: null, reason: null, source: null };
      }

      const { desc, ...rest } = result.post;
      const excerpt = desc
        ? desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
        : "";

      return {
        post: { ...rest, excerpt },
        reason: result.reason,
        source: result.source,
      };
    };

    // Only cache anonymous recommendations (progress makes results user-specific)
    const payload = userEmail
      ? await load()
      : await getCachedData(`learning:next:anon:${slug}`, load, 120);

    if (payload?.__status === 404) {
      return NextResponse.json(
        { message: payload.message },
        { status: 404 }
      );
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": userEmail
          ? "private, no-store"
          : "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("next article error:", err);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
};

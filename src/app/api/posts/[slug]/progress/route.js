import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { upsertPostProgress } from "@/utils/learningNext";

/**
 * POST /api/posts/[slug]/progress
 * Body: { status: "viewed" | "completed" }
 * Auth required. Powers personalized next-article skipping (Q4=C).
 */
export const POST = async (req, { params }) => {
  const { slug } = params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Not Authenticated!" }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ message: "Slug is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const status = body?.status;

    if (!["viewed", "completed"].includes(status)) {
      return NextResponse.json(
        { message: 'status must be "viewed" or "completed"' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { slug: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const progress = await upsertPostProgress(
      session.user.email,
      slug,
      status
    );

    return NextResponse.json(
      {
        postSlug: progress.postSlug,
        status: progress.status,
        updatedAt: progress.updatedAt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("progress error:", err);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
};

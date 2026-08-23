"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./continueLearning.module.css";

/**
 * Continue learning CTA — placed after article body, before comments (Q3=A).
 * Loads hybrid next recommendation from GET /api/posts/[slug]/next.
 */
const ContinueLearning = ({ slug }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        // Mark current article viewed (no-op if signed out)
        fetch(`/api/posts/${slug}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "viewed" }),
        }).catch(() => {});

        const res = await fetch(`/api/posts/${slug}/next`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setRecommendation(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setRecommendation(data?.post ? data : null);
        }
      } catch (err) {
        if (!cancelled) setRecommendation(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleContinue = () => {
    // Prefer completed when reader actively continues
    fetch(`/api/posts/${slug}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <section className={styles.container} aria-busy="true" aria-label="Continue learning">
        <p className={styles.eyebrow}>Continue learning</p>
        <div className={styles.skeleton} />
      </section>
    );
  }

  if (!recommendation?.post) {
    return null;
  }

  const { post, reason } = recommendation;
  if (!post.slug || !post.title) {
    return null;
  }

  const href = `/posts/${post.slug}`;

  return (
    <section className={styles.container} aria-label="Continue learning">
      <p className={styles.eyebrow}>Continue learning</p>
      {reason && <p className={styles.reason}>{reason}</p>}
      <Link href={href} className={styles.card} onClick={handleContinue}>
        {post.img ? (
          <div className={styles.imageWrap}>
            <Image
              src={post.img}
              alt={post.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>
        ) : null}
        <div className={styles.body}>
          <span className={styles.category}>{post.catSlug}</span>
          <h2 className={styles.title}>{post.title}</h2>
          {post.excerpt ? (
            <p className={styles.excerpt}>{post.excerpt}</p>
          ) : null}
          <span className={styles.cta}>Read next →</span>
        </div>
      </Link>
    </section>
  );
};

export default ContinueLearning;

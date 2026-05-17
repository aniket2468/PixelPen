"use client";

import { useEffect, useState } from "react";

const ViewTracker = ({ slug, initialViews, readTime }) => {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const track = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setViews(data.views);
        }
      } catch (err) {
        // Silently fail — view tracking is non-critical
      }
    };

    track();
  }, [slug]);

  return (
    <span>
      {readTime} min read • {views} views
    </span>
  );
};

export default ViewTracker;

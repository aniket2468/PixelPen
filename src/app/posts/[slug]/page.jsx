"use client";
import Menu from "@/components/menu/Menu";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Comments from "@/components/comments/Comments";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useState, useEffect } from "react";

const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

const SinglePage = ({ params }) => {
  const { slug } = params;

  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`, {
          cache: "no-store",
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    setShowSummary(true);

    try {
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.desc;
      let textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Truncate text if it's too long
      const MAX_CHARS = 8000;
      if (textContent.length > MAX_CHARS) {
        textContent = textContent.substring(0, MAX_CHARS) + "...";
      }
      
      const res = await fetch('/api/summarize', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleText: textContent }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        if (result.error === "API key not configured") {
          throw new Error("Summarization service is not properly configured. Please contact the administrator.");
        }
        throw new Error(result.error || "Failed to generate summary");
      }
      
      setSummary(result.summary || "Could not generate summary");
    } catch (error) {
      console.error("Summarization error:", error);
      setSummary(`Error: ${error.message || "Failed to generate summary. Please try again."}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loadingData) {
    return <div>Loading article...</div>;
  }

  if (!data) {
    return <div>Article not found.</div>;
  }

  const formattedDate = formatDistanceToNow(parseISO(data.createdAt), { addSuffix: true });
  const readTime = calculateReadTime(data.desc);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data?.title}</h1>
          <div className={styles.user}>
            {data?.user?.image && (
              <div className={styles.userImageContainer}>
                <Image src={data.user.image} alt="" fill className={styles.avatar} />
              </div>
            )}
            <div className={styles.userTextContainer}>
              <span className={styles.username}>{data?.user.name}</span>
              <span className={styles.date}>{formattedDate} • {readTime} min read</span>
            </div>
          </div>
        </div>
        {data?.img && (
          <div className={styles.imageContainer}>
            <Image src={data.img} alt="" fill className={styles.image} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.post}>
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: data?.desc }} />
          <div className={styles.comment}>
            <Comments postSlug={slug} />
          </div>
        </div>

        <div className={styles.sidebar}>
          <button 
            className={styles.summariseBtn} 
            onClick={handleSummarize} 
            disabled={loadingSummary}
            aria-label={loadingSummary ? "Generating summary..." : "Generate article summary"}
            role="button"
          >
            {loadingSummary ? (
              <span className={styles.loadingText}>
                Generating summary
                <span className={styles.loadingDots}>
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </span>
            ) : (
              "Summarize Blog"
            )}
          </button>

          {showSummary && (
            <div className={styles.summaryBox} role="region" aria-label="Article summary">
              {loadingSummary ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Generating summary...</p>
                </div>
              ) : (
                <p>{summary}</p>
              )}
            </div>
          )}

          <Menu />
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
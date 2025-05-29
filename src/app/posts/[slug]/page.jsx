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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`, {
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
          <Menu 
            articleContent={data?.desc} 
            articleTitle={data?.title}
          />
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
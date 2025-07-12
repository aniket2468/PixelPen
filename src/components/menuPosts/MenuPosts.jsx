"use client"
import React, { useEffect, useState } from 'react';
import styles from "./menuPosts.module.css";
import Link from 'next/link';
import Image from 'next/image';

const fetchPosts = async (type) => {
  const res = await fetch(`/api/posts?type=${type}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

const MenuPosts = ({ withImage, type }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts(type);
        setPosts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [type]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.items}>
      {posts.slice(0, 3).map((post, index) => (
        <Link href={`/posts/${post.slug}`} key={post._id || index} className={styles.item}>
          {withImage && post.img && (
            <div className={styles.imageContainer}>
              <Image src={post.img} alt={post.title} layout="fill" className={styles.image} />
            </div>
          )}
          <div className={styles.textContainer}>
            <span className={`${styles.category} ${styles[post.catSlug]}`}>
              {post.catSlug}
            </span>
            <h3 className={styles.postTitle}>
              {post.title}
            </h3>
            <div className={styles.detail}>
              <span className={styles.username}>{post.user?.name || post.userEmail}</span>
              <span className={styles.date}> - {new Date(post.createdAt).toISOString().substring(0, 10)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuPosts;

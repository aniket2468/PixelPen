"use client"
import React, { useEffect, useState, useCallback } from 'react';
import styles from "./cardList.module.css";
import Card from '../card/Card';

const CardList = ({ cat = '' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?cat=${cat}`, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [cat]);

  useEffect(() => {
    fetchPosts();
  }, [cat, fetchPosts]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Recent Posts</h1>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Recent Posts</h1>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recent Posts</h1>
      <div className={styles.posts}>
        {posts.map((item, index) => (
          <div key={item.id || `post-${index}`}>
            <Card item={item} />
          </div>
        ))}
      </div>
      
      {posts.length === 0 && !loading && (
        <div className={styles.noPosts}>No posts found.</div>
      )}
    </div>
  );
}

export default CardList;

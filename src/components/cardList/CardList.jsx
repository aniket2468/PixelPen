"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from "./cardList.module.css";
import Card from '../card/Card';

const CardList = ({ cat = '' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const observerRef = useRef();
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const totalCountRef = useRef(0);
  const catRef = useRef(cat);
  const initializedRef = useRef(false);
  
  const lastPostElementRef = useCallback(node => {
    if (loadingRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current) {
        const currentPostsCount = posts.length;
        const totalCount = totalCountRef.current;
        
        if (currentPostsCount < totalCount) {
          loadingRef.current = true;
          pageRef.current += 1;
          fetchPosts(pageRef.current, false);
        }
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [posts.length]);

  const fetchPosts = useCallback(async (pageNum, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        pageRef.current = pageNum;
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(`/api/posts?page=${pageNum}&cat=${catRef.current}`, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const newPosts = data.posts || [];
      
      if (reset) {
        setPosts(newPosts);
        totalCountRef.current = data.count || 0;
        setHasMore(newPosts.length < (data.count || 0));
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
          const updatedPosts = [...prevPosts, ...uniqueNewPosts];
          const stillHasMore = updatedPosts.length < totalCountRef.current;
          setHasMore(stillHasMore);
          return updatedPosts;
        });
      }
      
      setLoading(false);
      setLoadingMore(false);
      setError(null);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      setLoadingMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // Handle both initial load and category changes
  useEffect(() => {
    const shouldReset = !initializedRef.current || catRef.current !== cat;
    
    if (shouldReset) {
      catRef.current = cat;
      pageRef.current = 1;
      totalCountRef.current = 0;
      setPosts([]);
      setHasMore(true);
      setError(null);
      loadingRef.current = false;
      initializedRef.current = true;
      
      fetchPosts(1, true);
    }
  }, [cat, fetchPosts]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
        {posts.map((item, index) => {
          const isLast = index === posts.length - 1;
          const cardElement = <Card item={item} />;
          
          if (isLast && hasMore) {
            return (
              <div ref={lastPostElementRef} key={item.id || `post-${index}`}>
                {cardElement}
              </div>
            );
          } else {
            return (
              <div key={item.id || `post-${index}`}>
                {cardElement}
              </div>
            );
          }
        })}
      </div>
      
      {loadingMore && (
        <div className={styles.loadingMore}>Loading more posts...</div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className={styles.endMessage}>You&apos;ve reached the end of the posts!</div>
      )}
      
      {posts.length === 0 && !loading && (
        <div className={styles.noPosts}>No posts found.</div>
      )}
    </div>
  );
}

export default CardList;

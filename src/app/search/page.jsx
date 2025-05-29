"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import Card from '@/components/card/Card';
import Menu from '@/components/menu/Menu';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const observerRef = useRef();
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const postsCountRef = useRef(0);
  const totalCountRef = useRef(0);
  const queryRef = useRef(query);
  const initializedRef = useRef(false);
  
  // Update refs when values change
  useEffect(() => {
    postsCountRef.current = posts.length;
  }, [posts.length]);
  
  const lastPostElementRef = useCallback(node => {
    if (loadingRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && postsCountRef.current < totalCountRef.current) {
        loadingRef.current = true;
        pageRef.current += 1;
        fetchSearchResults(pageRef.current, false);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observerRef.current.observe(node);
  }, []);

  const fetchSearchResults = useCallback(async (pageNum, reset = false) => {
    if (!queryRef.current) return;
    
    try {
      if (reset) {
        setLoading(true);
        pageRef.current = pageNum;
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(`/api/search?query=${encodeURIComponent(queryRef.current)}&page=${pageNum}`);
      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await res.json();
      const newPosts = data.posts || [];
      
      if (reset) {
        setPosts(newPosts);
        postsCountRef.current = newPosts.length;
      } else {
        setPosts(prevPosts => {
          // Prevent duplicates
          const existingIds = new Set(prevPosts.map(post => post._id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post._id));
          const updatedPosts = [...prevPosts, ...uniqueNewPosts];
          postsCountRef.current = updatedPosts.length;
          return updatedPosts;
        });
      }
      
      // Update total count and check if there are more posts
      totalCountRef.current = data.count || 0;
      const newTotal = reset ? newPosts.length : postsCountRef.current + newPosts.length;
      setHasMore(newTotal < totalCountRef.current);
      
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

  // Handle both initial load and query changes
  useEffect(() => {
    const shouldReset = (!initializedRef.current && query) || (queryRef.current !== query && query);
    
    if (shouldReset) {
      queryRef.current = query;
      pageRef.current = 1;
      postsCountRef.current = 0;
      totalCountRef.current = 0;
      setPosts([]);
      setHasMore(true);
      setError(null);
      loadingRef.current = false;
      initializedRef.current = true;
      
      // Always fetch on reset
      fetchSearchResults(1, true);
    }
  }, [query, fetchSearchResults]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <h1 className={styles.title}>Search Results</h1>
          <div className={styles.loading}>Loading...</div>
        </div>
        <div className={styles.menu}>
          <Menu />
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <h1 className={styles.title}>Search Results</h1>
          <div className={styles.error}>Error: {error}</div>
        </div>
        <div className={styles.menu}>
          <Menu />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <h1 className={styles.title}>Search Results</h1>
          {posts.length > 0 ? (
            <>
              {posts.map((item, index) => {
                const isLast = index === posts.length - 1;
                const cardElement = <Card item={item} />;
                
                if (isLast && hasMore) {
                  return (
                    <div ref={lastPostElementRef} key={item._id || `search-${index}`}>
                      {cardElement}
                    </div>
                  );
                } else {
                  return (
                    <div key={item._id || `search-${index}`}>
                      {cardElement}
                    </div>
                  );
                }
              })}
              
              {loadingMore && (
                <div className={styles.loadingMore}>Loading more results...</div>
              )}
              
              {!hasMore && (
                <div className={styles.endMessage}>You&apos;ve seen all the search results!</div>
              )}
            </>
          ) : (
            <div className={styles.noPosts}>No results found for &quot;{query}&quot;</div>
          )}
        </div>
        <div className={styles.menu}>
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

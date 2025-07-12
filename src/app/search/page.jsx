"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import Card from '@/components/card/Card';
import Menu from '@/components/menu/Menu';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSearchResults = useCallback(async () => {
    if (!query) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await res.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, fetchSearchResults]);

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
          <div className={styles.searchHeader}>
            <h1 className={styles.title}>Search Results</h1>
            {query && (
              <div className={styles.searchMeta}>
                <span className={styles.searchQuery}>
                  Results for &quot;{query}&quot;
                </span>
                {posts.length > 0 && (
                  <span className={styles.searchCount}>
                    {posts.length} {posts.length === 1 ? 'result' : 'results'} found
                  </span>
                )}
              </div>
            )}
          </div>
          
          {posts.length > 0 ? (
            <div className={styles.resultsGrid}>
              {posts.map((item, index) => (
                <div key={item.id || `search-${index}`}>
                  <Card item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noPosts}>
              <div className={styles.noPostsIcon}>🔍</div>
              <h3>No results found</h3>
              <p>No results found for &quot;{query}&quot;</p>
              <p>Try searching for something else or check your spelling.</p>
            </div>
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

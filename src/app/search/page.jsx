"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './search.module.css';
import Card from '@/components/card/Card';
import Menu from '@/components/menu/Menu';
import Pagination from '@/components/pagination/Pagination';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page')) || 1;
  const [data, setData] = useState({ posts: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const POST_PER_PAGE = 4;

  useEffect(() => {
    if (query) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&page=${page}`);
          if (!res.ok) {
            throw new Error('Failed to fetch search results');
          }
          const result = await res.json();
          setData(result);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [query, page]);

  const hasPrev = POST_PER_PAGE * (page - 1) > 0;
  const hasNext = POST_PER_PAGE * page < data.count;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <h1 className={styles.title}>Search Results</h1>
          {data.posts.length > 0 ? (
            data.posts.map((item) => (
              <Card item={item} key={item._id} />
            ))
          ) : (
            <p>No results found</p>
          )}
          <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
        </div>
        <div className={styles.menu}>
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

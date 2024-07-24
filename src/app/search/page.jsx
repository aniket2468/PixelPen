"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './search.module.css';
import Card from '@/components/card/Card';
import Menu from '@/components/menu/Menu';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/search?query=${query}`);
          if (!res.ok) {
            throw new Error('Failed to fetch search results');
          }
          const data = await res.json();
          setData(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <h1 className={styles.title}>Search Results</h1>
          {data.map((item) => (
            <Card item={item} key={item._id} />
          ))}
        </div>
        <div className={styles.menu}>
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

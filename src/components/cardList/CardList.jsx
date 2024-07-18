"use client"
import React, { useEffect, useState } from 'react';
import styles from "./cardList.module.css";
import Pagination from '../pagination/Pagination';
import Card from '../card/Card';

const getData = async (page = 1, cat = '') => {
  const res = await fetch(
    `https://pixelpen.vercel.app/api/posts?page=${page}&cat=${cat}`,
    {
      cache: "no-store"
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

const CardList = ({ page = 1, cat = '' }) => {
  const [data, setData] = useState({ posts: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData(page, cat);
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [page, cat]);

  const POST_PER_PAGE = 2;

  const hasPrev = POST_PER_PAGE * (page - 1) > 0;
  const hasNext = POST_PER_PAGE * (page - 1) + POST_PER_PAGE < data.count;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recent Posts</h1>
      <div className={styles.posts}>
        {data.posts?.map((item) => (
          <Card item={item} key={item._id} />
        ))}
      </div>
      <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
    </div>
  );
}

export default CardList;

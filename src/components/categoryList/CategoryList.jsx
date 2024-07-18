"use client"
import React, { useEffect, useState } from 'react';
import styles from "./categoryList.module.css";
import Link from 'next/link';
import Image from 'next/image';

const CategoryList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Categories</h1>
      <div className={styles.categories}>
        {data?.map((item) => (
          <Link 
            href={`/blog?cat=${item.slug}`} 
            className={styles.category}
            key={item.id}
          >
            {item.img && (
              <Image 
                src={item.img}
                alt={item.title}
                width={32} 
                height={32} 
                className={styles.image}
              />
            )}
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;

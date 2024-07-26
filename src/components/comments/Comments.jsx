"use client"
import React, { useState } from 'react';
import styles from './comments.module.css';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message);
    throw error;
  }

  return data;
};

const Comments = ({ postSlug }) => {
  const { data: session, status } = useSession();
  const { data, mutate, isLoading } = useSWR(
    `/api/comments?postSlug=${postSlug}`,
    fetcher
  );

  const currentUrl = encodeURIComponent(`/posts/${postSlug}`)

  const [desc, setDesc] = useState('');

  const handleSubmit = async () => {
    await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ desc, postSlug }),
    });
    setDesc('');
    mutate();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Comments</h1>
      {status === 'authenticated' ? (
        <div className={styles.write}>
          <textarea
            placeholder="Write a comment..."
            className={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button className={styles.button} onClick={handleSubmit}>
            Send
          </button>
        </div>
      ) : (
        <Link href={`/login?callbackUrl=${currentUrl}`}>Login to write a comment</Link>
      )}
      <div className={styles.comments}>
        {isLoading
          ? 'Loading...'
          : data?.map((item) => (
              <div className={styles.comment} key={item._id}>
                <div className={styles.user}>
                  {item?.user?.image && (
                    <Image
                      src={item.user.image}
                      alt=""
                      width={50}
                      height={50}
                      className={styles.image}
                    />
                  )}
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{item.user.name}</span>
                    <span className={styles.date}>
                      {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Comments;

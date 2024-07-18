import React from 'react'
import styles from './card.module.css'
import Image from 'next/image'
import Link from 'next/link'

const Card = ({ item }) => {
  const truncateText = (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div className={styles.container} key={item._id}>
      {item.img && (
        <div className={styles.imageContainer}>
          <Image src={item.img} alt={item.title} layout="fill" className={styles.image} />
        </div>
      )}
      <div className={styles.textContainer}>
        <div className={styles.detail}>
          <span className={styles.date}>
            {item.createdAt.substring(0, 10)} -{" "}   
          </span>
          <span className={styles.category}>{item.catSlug}</span>
        </div>
        <Link href={`/posts/${item.slug}`}>
          <h1>{item.title}</h1>
        </Link>
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: truncateText(item.desc, 60) }} />
        <Link href={`/posts/${item.slug}`} className={styles.link}>Read More</Link>
      </div>
    </div>
  );
};

export default Card;

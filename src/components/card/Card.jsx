import React from 'react';
import styles from './card.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Card = ({ item }) => {
  const stripHtmlTags = (html) => {
    if (!html) return '';
    
    try {
      // Use DOMParser instead of createElement to avoid DOM manipulation issues
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || doc.body.innerText || '';
      } else {
        // Fallback: simple regex-based tag removal and entity decoding
        let stripped = html.replace(/<[^>]*>/g, '');
        
        // Basic HTML entity decoding without creating DOM elements
        const entityMap = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
          '&nbsp;': ' ',
          '&apos;': "'"
        };
        
        stripped = stripped.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
          return entityMap[entity] || entity;
        });
        
        return stripped.trim();
      }
    } catch (error) {
      console.warn('Failed to strip HTML tags, using fallback:', error);
      // Fallback: simple regex-based tag removal
      return html.replace(/<[^>]*>/g, '').trim();
    }
  };

  return (
    <div className={styles.container}>
      {item.img && (
        <div className={styles.imageContainer}>
          <Image src={item.img} alt={item.title} layout="fill" className={styles.image} />
        </div>
      )}
      <div className={styles.textContainer}>
        <div className={styles.detail}>
          <span className={styles.date}>
            {new Date(item.createdAt).toISOString().substring(0, 10)} -{" "}
          </span>
          <span className={styles.category}>{item.catSlug}</span>
        </div>
        <Link href={`/posts/${item.slug}`}>
          <h1>{item.title}</h1>
        </Link>
        <div className={styles.desc}>
          {stripHtmlTags(item.desc)}
        </div>
        <Link href={`/posts/${item.slug}`} className={styles.link}>Read More</Link>
      </div>
    </div>
  );
};

export default Card;

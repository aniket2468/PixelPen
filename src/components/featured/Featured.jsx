'use client';

import React, { useContext, useEffect, useRef } from 'react'
import styles from "./featured.module.css"
import { motion } from 'framer-motion'
import { ThemeContext } from '@/context/ThemeContext'
import { gsap } from 'gsap'
import Link from 'next/link'

const Feature = () => {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate blobs continuously
      blobsRef.current.forEach((blob, index) => {
        if (blob && blob.parentNode) {
          // Initial animation
          gsap.fromTo(blob, 
            { 
              scale: 0,
              opacity: 0,
              rotation: 0
            },
            {
              scale: 1,
              opacity: 1,
              rotation: 360,
              duration: 2,
              delay: index * 0.2,
              ease: "elastic.out(1, 0.5)"
            }
          );

          // Continuous floating animation
          gsap.to(blob, {
            x: () => gsap.utils.random(-50, 50),
            y: () => gsap.utils.random(-40, 40),
            rotation: () => gsap.utils.random(0, 360),
            scale: () => gsap.utils.random(0.9, 1.1),
            duration: () => gsap.utils.random(4, 8),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.5
          });

          // Color shifting animation
          gsap.to(blob, {
            filter: `hue-rotate(${gsap.utils.random(0, 360)}deg)`,
            duration: gsap.utils.random(3, 6),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      });

      // Title animation
      if (titleRef.current && titleRef.current.children) {
        gsap.fromTo(titleRef.current.children,
          {
            y: 100,
            opacity: 0,
            scale: 0.8
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.5,
            stagger: 0.2,
            ease: "back.out(1.7)",
            delay: 0.5
          }
        );
      }

      // Subtitle animation
      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          {
            y: 50,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            delay: 1.2
          }
        );
      }

      // CTA animation
      if (ctaRef.current && ctaRef.current.children) {
        gsap.fromTo(ctaRef.current.children,
          {
            scale: 0,
            opacity: 0
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)",
            delay: 1.5
          }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [theme]);

  // Add blob reference safely
  const addBlobRef = (el, index) => {
    if (el) {
      blobsRef.current[index] = el;
    }
  };

  // Scroll to recent posts section
  const scrollToRecentPosts = () => {
    const recentPostsSection = document.getElementById('recent-posts') || 
                              document.querySelector('.recent-posts') ||
                              document.querySelector('[data-section="recent-posts"]');
    
    if (recentPostsSection) {
      recentPostsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll down by viewport height
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${theme === 'dark' ? styles.dark : styles.light}`}
    >
      {/* Animated Background Blobs */}
      <div className={styles.blobContainer}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            ref={(el) => addBlobRef(el, i)}
            className={`${styles.blob} ${styles[`blob${i + 1}`]}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div ref={titleRef} className={styles.titleContainer}>
          <div className={styles.titleLine1}>
            <span className={styles.highlight}>Pixels of Thought</span>
          </div>
          <div className={styles.titleLine2}>
            Pens of Change
          </div>
        </div>

        <div 
          ref={subtitleRef}
          className={styles.subtitle}
        >
          PixelPen - A wildly robust writing platform built for storytellers
        </div>

        <div ref={ctaRef} className={styles.ctaContainer}>
          <motion.button 
            className={styles.primaryCta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToRecentPosts}
          >
            Get Started
          </motion.button>
          <Link href="/about">
            <motion.button 
              className={styles.secondaryCta}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Feature

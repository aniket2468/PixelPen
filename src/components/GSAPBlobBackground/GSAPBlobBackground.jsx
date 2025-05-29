'use client';

import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { gsap } from 'gsap';
import styles from './GSAPBlobBackground.module.css';

const GSAPBlobBackground = ({ className = '', blobCount = 8 }) => {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const contextRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous context if it exists
    if (contextRef.current) {
      contextRef.current.revert();
      contextRef.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      contextRef.current = gsap.context(() => {
        // Filter out null/undefined refs and ensure elements are in DOM
        const validBlobs = blobsRef.current.filter(blob => 
          blob && blob.parentNode && document.contains(blob)
        );

        validBlobs.forEach((blob, index) => {
          // Initial animation with higher opacity
          gsap.fromTo(blob, 
            { 
              scale: 0,
              opacity: 0,
              rotation: 0
            },
            {
              scale: 1,
              opacity: theme === 'dark' ? 0.8 : 0.6,
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
        });
      }, containerRef);
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      // Safer cleanup
      if (contextRef.current) {
        try {
          contextRef.current.revert();
        } catch (error) {
          console.warn('GSAP context cleanup warning:', error);
        } finally {
          contextRef.current = null;
        }
      }
    };
  }, [theme, blobCount]);

  // Simplified blob reference assignment
  const addBlobRef = (el, index) => {
    if (el) {
      blobsRef.current[index] = el;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.blobContainer} ${theme === 'dark' ? styles.dark : styles.light} ${className}`}
    >
      {[...Array(blobCount)].map((_, i) => (
        <div
          key={i}
          ref={(el) => addBlobRef(el, i)}
          className={`${styles.blob} ${styles[`blob${(i % 8) + 1}`]}`}
        />
      ))}
    </div>
  );
};

export default GSAPBlobBackground; 
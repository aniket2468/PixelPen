"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import ThemeToggle from '../themeToggle/ThemeToggle';
import AuthLinks from '../authLinks/AuthLinks';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const searchFormRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Safe DOM element check
  const isElementInDOM = (element) => {
    try {
      return element && 
             element.parentNode && 
             document.contains && 
             document.contains(element) &&
             element.isConnected !== false;
    } catch (error) {
      return false;
    }
  };

  // Safe event listener helpers
  const safeAddEventListener = (element, event, handler) => {
    try {
      if (element && typeof element.addEventListener === 'function' && handler) {
        element.addEventListener(event, handler);
        return true;
      }
    } catch (error) {
      // Silently ignore setup errors
    }
    return false;
  };

  const safeRemoveEventListener = (element, event, handler) => {
    try {
      if (element && typeof element.removeEventListener === 'function' && handler) {
        element.removeEventListener(event, handler);
      }
    } catch (error) {
      // Silently ignore cleanup errors
    }
  };

  const handleClickOutside = useCallback((event) => {
    try {
      if (searchFormRef.current && 
          isElementInDOM(searchFormRef.current) && 
          !searchFormRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    } catch (error) {
      // Silently ignore errors
    }
  }, []);

  useEffect(() => {
    if (showSearch) {
      const added = safeAddEventListener(document, 'click', handleClickOutside);
      if (!added) {
        // Fallback: close search if we can't add listener
        setShowSearch(false);
      }
    }

    return () => {
      safeRemoveEventListener(document, 'click', handleClickOutside);
    };
  }, [showSearch, handleClickOutside]);

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/">PixelPen</Link>
      </div>
      <div className={styles.links}>
        <ThemeToggle />
        <form
          className={`${styles.searchForm} ${showSearch ? styles.show : ''}`}
          onSubmit={handleSearch}
          ref={searchFormRef}
        >
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
        <button className={styles.searchToggle} onClick={() => setShowSearch(!showSearch)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
        <AuthLinks />
      </div>
    </div>
  );
}

export default Navbar;

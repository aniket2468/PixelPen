"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faLinkedin,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";
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

  const handleClickOutside = (event) => {
    if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (showSearch) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.social}>
        <a href="https://www.youtube.com/"><FontAwesomeIcon icon={faYoutube} /></a>
        <a href="https://www.facebook.com/"><FontAwesomeIcon icon={faFacebook} /></a>
        <a href="https://www.instagram.com/"><FontAwesomeIcon icon={faInstagram} /></a>
        <a href="https://www.linkedin.com/"><FontAwesomeIcon icon={faLinkedin} /></a>
      </div>
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

"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import styles from "./navbar.module.css"
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
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/search?query=${searchQuery}`);
    }
  };

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
            <ThemeToggle/>
            <form className={styles.searchForm} onSubmit={handleSearch}>
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
            <AuthLinks/>
        </div>
    </div>
  )
}

export default Navbar

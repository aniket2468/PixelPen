"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import ThemeToggle from '../themeToggle/ThemeToggle';
import AuthLinks from '../authLinks/AuthLinks';
import SearchDropdown from '../searchDropdown/SearchDropdown';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle search input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      inputRef.current && inputRef.current.blur();
    }
  };

  // Handle search icon click (mobile)
  const handleSearchClick = () => {
    if (isMobile) {
      router.push('/mobile-search');
    }
  };

  // Hide dropdown on blur (with delay for click)
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/">PixelPen</Link>
      </div>
      <div className={styles.links}>
        <ThemeToggle />
        {/* Desktop: Inline search input */}
        {!isMobile && (
          <div className={styles.searchInline}>
            <form onSubmit={handleSubmit} className={styles.searchForm} autoComplete="off">
              <div className={styles.inputContainer}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={handleBlur}
                  placeholder="Search blogs..."
                  className={styles.searchInput}
                  autoComplete="off"
                  aria-label="Search blogs"
                />
              </div>
            </form>
            {/* Dropdown below input */}
            {showDropdown && (
              <div className={styles.dropdownWrapper}>
                <SearchDropdown 
                  query={query}
                  onSelect={(val) => {
                    setQuery(val);
                    router.push(`/search?query=${encodeURIComponent(val)}`);
                    setShowDropdown(false);
                  }}
                  onBlur={handleBlur}
                  isInline={true}
                />
              </div>
            )}
          </div>
        )}
        {/* Mobile: Search icon button */}
        {isMobile && (
          <button 
            className={styles.searchToggle} 
            onClick={handleSearchClick}
            aria-label="Search"
            title="Search blogs"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        )}
        <AuthLinks />
      </div>
    </div>
  );
}

export default Navbar;

"use client"
import React, { useState, useEffect, useRef } from 'react';
import styles from "./authLinks.module.css";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const AuthLinks = () => {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState(session?.user?.username);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (status === 'authenticated' && !username) {
      }
    };
    fetchUsername();
  }, [status, username]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  const userProfilePic = session?.user?.image;

  return (
    <div className={styles.authLinksContainer}>
      {status === "unauthenticated" ? (
        <>
          <div className={styles.profilePicContainer} onClick={toggleDropdown}>
            <FontAwesomeIcon icon={faUser} className={styles.profileIcon} />
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu} ref={dropdownRef}>
              <Link href="/login" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Login</Link>
            </div>
          )}
        </>
      ) : (
        <>
          <Link href="/write" className={styles.link}>Write</Link>
          <div className={styles.profilePicContainer} onClick={toggleDropdown}>
            {userProfilePic ? (
              <Image
                src={userProfilePic}
                alt="Profile Picture"
                className={styles.profilePic}
                width={40}
                height={40}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} className={styles.profileIcon} />
            )}
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu} ref={dropdownRef}>
              <Link href={`/${username}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
              <span className={styles.dropdownItem} onClick={handleSignOut}>Logout</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuthLinks;

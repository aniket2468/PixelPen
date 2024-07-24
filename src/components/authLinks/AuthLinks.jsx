"use client"
import React, { useState } from 'react';
import styles from "./authLinks.module.css";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const AuthLinks = () => {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userProfilePic = session?.user?.image;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
  };

  return (
    <div className={styles.authLinksContainer}>
      {status === "unauthenticated" ? (
        <>
          <div className={styles.profilePicContainer} onClick={toggleDropdown}>
            <FontAwesomeIcon icon={faUser} className={styles.profileIcon} />
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/login" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Login</Link>
            </div>
          )}
        </>
      ) : (
        <>
          <Link href="/write" className={styles.link}>Write</Link>
          <div className={styles.profilePicContainer} onClick={toggleDropdown}>
            <Image
              src={userProfilePic}
              alt="Profile Picture"
              className={styles.profilePic}
              width={40}
              height={40}
            />
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
              <span className={styles.dropdownItem} onClick={handleSignOut}>Logout</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuthLinks;

"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./authLinks.module.css";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCog, 
  faSignOutAlt, 
  faSignInAlt,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

const AuthLinks = () => {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use username directly from session, with fallback to API fetch
  const username = session?.user?.username;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
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
      if (dropdownRef.current && 
          isElementInDOM(dropdownRef.current) && 
          !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    } catch (error) {
      // Silently ignore errors
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      const added = safeAddEventListener(document, 'click', handleClickOutside);
      if (!added) {
        // Fallback: close dropdown if we can't add listener
        setDropdownOpen(false);
      }
    }

    return () => {
      safeRemoveEventListener(document, 'click', handleClickOutside);
    };
  }, [dropdownOpen, handleClickOutside]);

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
              <Link href="/login" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faSignInAlt} />
                Login
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          <Link href="/write" className={styles.link}>
            Write
          </Link>
          <div className={styles.profilePicContainer} onClick={toggleDropdown}>
            {userProfilePic ? (
              <Image
                src={userProfilePic}
                alt="Profile Picture"
                className={styles.profilePic}
                width={42}
                height={42}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} className={styles.profileIcon} />
            )}
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownMenu} ref={dropdownRef}>
              <Link href="/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faCog} />
                Profile Settings
              </Link>
              {username && (
                <Link href={`/profile/${username}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  <FontAwesomeIcon icon={faUser} />
                  View Profile
                </Link>
              )}
              <button className={styles.dropdownItem} onClick={handleSignOut}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuthLinks;

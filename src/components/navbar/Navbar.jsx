import React from 'react'
import styles from "./navbar.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faLinkedin,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import ThemeToggle from '../themeToggle/ThemeToggle';
import AuthLinks from '../authLinks/AuthLinks';

 
const Navbar = () => {
  return (
    <div className={styles.container}>
        <div className={styles.social}>
            <a href="https://www.youtube.com/"><FontAwesomeIcon icon={faYoutube} /></a>
            <a href="https://www.facebook.com/"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="https://www.instagram.com/"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://www.linkedin.com/"><FontAwesomeIcon icon={faLinkedin} /></a>
        </div>
        <div className={styles.logo}>PixelPen</div>
        <div className={styles.links}>
            <ThemeToggle/>
            <Link href="/" className={styles.link} >Homepage</Link>
            <Link href="/" className={styles.link} >Contact</Link>
            <Link href="/" className={styles.link} >About</Link>
            <AuthLinks/>
        </div>
    </div>
  )
}

export default Navbar

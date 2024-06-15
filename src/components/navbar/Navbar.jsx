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
            <a href="https://www.youtube.com/"><FontAwesomeIcon icon={faYoutube} width={24}  /></a>
            <a href="https://www.facebook.com/"><FontAwesomeIcon icon={faFacebook} width={24} /></a>
            <a href="https://www.instagram.com/"><FontAwesomeIcon icon={faInstagram} width={24} /></a>
            <a href="https://www.linkedin.com/"><FontAwesomeIcon icon={faLinkedin} width={24} /></a>
        </div>
        <div className={styles.logo}>PixelPen</div>
        <div className={styles.links}>
            <ThemeToggle/>
            <Link href="/">Homepage</Link>
            <Link href="/">Contact</Link>
            <Link href="/">About</Link>
            <AuthLinks/>
        </div>
    </div>
  )
}

export default Navbar

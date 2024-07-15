import React from 'react'
import styles from "./footer.module.css"
import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faLinkedin,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";
import Link from 'next/link'

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <Image src='/logo.png' alt='PixelPen' width={50} height={50} />
          <h1 className={styles.logoText}>PixelPen</h1>
        </div>
        <p className={styles.desc}>
        PixelPen is a dynamic new platform designed for writers, thinkers, and storytellers to share their unique voices with the world. Inspired by the simplicity and elegance of Medium.com, PixelPen offers an intuitive and visually appealing space where creativity can flourish. Whether you&apos;re a seasoned writer or just starting your journey, PixelPen empowers you to craft engaging content, connect with a diverse audience, and inspire readers with your words. Join us in transforming thoughts into powerful narratives, one pixel at a time.
        </p>
        <div className={styles.icons}>
        <a href="https://www.youtube.com/"><FontAwesomeIcon icon={faYoutube} /></a>
        <a href="https://www.facebook.com/"><FontAwesomeIcon icon={faFacebook} /></a>
        <a href="https://www.instagram.com/"><FontAwesomeIcon icon={faInstagram} /></a>
        <a href="https://www.linkedin.com/"><FontAwesomeIcon icon={faLinkedin} /></a>
        </div>
      </div>
      <div className={styles.links}>
      <div className={styles.list}>
          <span className={styles.listTitle}>Links</span>
          <Link href="/">Homepage</Link>
          <Link href="/">Blog</Link>
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Tags</span>
          <Link href="/">Style</Link>
          <Link href="/">Fashion</Link>
          <Link href="/">Coding</Link>
          <Link href="/">Culture</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Social</span>
          <Link href="/">Facebook</Link>
          <Link href="/">Instagram</Link>
          <Link href="/">Youtube</Link>
          <Link href="/">LinkedIn</Link>
        </div>
      </div>
    </div>
  )
}

export default Footer

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
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis vitae, ullam magnam excepturi porro placeat veniam itaque fugiat commodi. Et, iure repellendus. Officia sed provident culpa voluptates porro quisquam. Ad.
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

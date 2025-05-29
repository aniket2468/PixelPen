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
          Where stories come alive. A modern platform for writers to share their voice and connect with readers.
        </p>
      </div>
      <div className={styles.links}>
        <div className={styles.linkContainer}>
          <div className={styles.linkRow}>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/write">Write</Link>
            <Link href="/settings">Settings</Link>
          </div>
          <div className={styles.linkRow}>
            <Link href="/blog?cat=style">Style</Link>
            <Link href="/blog?cat=fashion">Fashion</Link>
            <Link href="/blog?cat=coding">Coding</Link>
            <Link href="/blog?cat=culture">Culture</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer

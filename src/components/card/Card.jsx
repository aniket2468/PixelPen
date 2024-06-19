import React from 'react'
import styles from './card.module.css'
import Image from 'next/image'
import Link from 'next/link'

const Card = () => {
  return (
    <div className={styles.container}>
        <div className={styles.imageContainer}>
        <Image src='/p1.jpg' alt='' fill className={styles.image}/>
        </div>
        <div className={styles.textContainer}>
        <div className={styles.detail}>
            <span className={styles.date}>06.19.2024 - </span>
            <span className={styles.category}>CULTURE</span>
        </div>
        <Link href="/">
            <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
        </Link>
        <p className={styles.desc}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consectetur, sit. Voluptates in consectetur esse quaerat error praesentium velit laboriosam, minima ut culpa suscipit eligendi est, reiciendis possimus saepe! Accusamus, debitis...
        </p>
        <Link href="/" className={styles.link}>Read More</Link>
        </div>
    </div>
  )
}

export default Card

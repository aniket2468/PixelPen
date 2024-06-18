import React from 'react'
import styles from "./featured.module.css"
import Image from 'next/image'

const Feature = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b>Pixels</b> of Thought, <b>Pens</b> of Change.
      </h1>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/p1.jpg" alt="" fill className={styles.image}/>
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>Introducing PixelPen: Your Canvas for Creative Expression</h1>
          <p className={styles.postDesc}>
          PixelPen is a dynamic new platform designed for writers, thinkers, and storytellers to share their unique voices with the world. Inspired by the simplicity and elegance of Medium.com, PixelPen offers an intuitive and visually appealing space where creativity can flourish. Whether you're a seasoned writer or just starting your journey, PixelPen empowers you to craft engaging content, connect with a diverse audience, and inspire readers with your words. Join us in transforming thoughts into powerful narratives, one pixel at a time.
          </p>
          <button className={styles.button}>Read More</button>
        </div>
      </div>
    </div>
  )
}

export default Feature

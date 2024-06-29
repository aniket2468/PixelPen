import React from 'react'
import styles from './singlePage.module.css'
import Image from 'next/image'
import Menu from '@/components/menu/Menu'
import Comments from '@/components/comments/Comments'

const SinglePage = () => {
  return (
    <div className={styles.container}>
        <div className={styles.infoContainer}>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</h1>
                <div className={styles.user}>
                    <div className={styles.userImageContainer}>
                        <Image src="/p1.jpg" alt="" fill className={styles.avatar}/>
                    </div>
                    <div className={styles.userTextContainer}>
                        <span className={styles.username}>Aniket Sharma</span>
                        <span className={styles.date}>06.28.2024</span>
                    </div>
                </div>
            </div>
            <div className={styles.imageContainer}>
                <Image src="/p1.jpg" alt="" fill className={styles.image}/>
            </div>
        </div>
        <div className={styles.content}>
            <div className={styles.post}>
                <div className={styles.description}>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa accusantium, dignissimos, ex earum tempore explicabo a quia laborum nobis provident numquam aperiam rerum sapiente iure nulla alias perspiciatis. Iusto, assumenda?</p>
                    <h2>Lorem ipsum dolor sit amet consectetur, adipisicing elit.</h2>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa accusantium, dignissimos, ex earum tempore explicabo a quia laborum nobis provident numquam aperiam rerum sapiente iure nulla alias perspiciatis. Iusto, assumenda?</p>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa accusantium, dignissimos, ex earum tempore explicabo a quia laborum nobis provident numquam aperiam rerum sapiente iure nulla alias perspiciatis. Iusto, assumenda?</p>
                </div>
                <div className={styles.comment}>
                    <Comments/>
                </div>
            </div>
            <Menu/>
        </div>
    </div>
  )
}

export default SinglePage

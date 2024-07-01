"use client"
import React, { useState } from 'react'
import styles from './writePage.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faImage,
    faUpload,
    faVideo
  } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.bubble.css";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const WritePage = () => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    const { status } = useSession()
    const router = useRouter()

    if(status === "loading"){
      return <div className={styles.loading}>Loading...</div>
    }

    if(status === "authenticated"){
      router.push("/")
    }

  return (
    <div className={styles.container}>
      <input type="text" placeholder='Title' className={styles.input}/>
      <div className={styles.editor}>
        <button className={styles.button} onClick={() => setOpen(!open)}>
            <FontAwesomeIcon icon={faPlus} width={16} height={16}/>
        </button>
        {open && (
            <div className={styles.add}>
                <button className={styles.addButton}>
                    <FontAwesomeIcon icon={faImage} width={16} height={16}/>
                </button>
                <button className={styles.addButton}>
                    <FontAwesomeIcon icon={faUpload} width={16} height={16}/>
                </button>
                <button className={styles.addButton}>
                    <FontAwesomeIcon icon={faVideo} width={16} height={16}/>
                </button>
            </div>
        )}
        <ReactQuill className={styles.textArea} theme='bubble' value={value} onChange={setValue} placeholder='Tell your story...'/>
      </div>
      <button className={styles.publish}>Publish</button>
    </div>
  )
}

export default WritePage

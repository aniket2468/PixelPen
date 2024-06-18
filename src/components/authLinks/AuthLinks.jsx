"use client"
import React from 'react'
import styles from "./authLinks.module.css"
import Link from 'next/link'
import { useState } from 'react'

const AuthLinks = () => {

    const [open, setOpen] = useState(false)

    const status = "nonauthenticated"
    return (
    <>
    {status==="nonauthenticated" ? (
        <Link href="/login" className={styles.link}>Login</Link>
        ) : (
        <>
        <Link href="/write">Write</Link>
        <span className={styles.link}>Logout</span>
        </>
        )}
        <div className={`${styles.burger} ${open ? styles.open : ''}`} onClick={()=>setOpen(!open)}>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
        </div>
        {open && (
            <div className={styles.responsiveMenu}>
                <Link href="/">Homepage</Link>
                <Link href="/">Contact</Link>
                <Link href="/">About</Link>
                {status==="nonauthenticated" ? (
                <Link href="/login">Login</Link>
                ) : (
                <>
                <Link href="/write">Write</Link>
                <span className={styles.link}>Logout</span>
                </>
                )}
            </div>
        )}
    </>
    )
}

export default AuthLinks

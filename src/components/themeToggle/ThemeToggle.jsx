"use client"
import React, { useContext } from 'react'
import styles from "./themeToggle.module.css"
import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
} from "@fortawesome/fontawesome-free-solid";
import { ThemeContext } from '@/context/ThemeContext';

const ThemeToggle = () => {

  const {toggle, theme} = useContext(ThemeContext)

  return (
    <div className={styles.container} onClick={toggle}>
      <FontAwesomeIcon icon={ faMoon } width={14}/>
      <div className={`${styles.ball} ${theme === 'dark' ? styles.ballMove : ''}`}></div>
      <FontAwesomeIcon icon={ faSun } width={14}/>
    </div>
  )
}

export default ThemeToggle

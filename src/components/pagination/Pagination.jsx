"use client"
import React from 'react'
import styles from "./pagination.module.css"
import { useRouter, useSearchParams } from 'next/navigation'

const Pagination = ({ page, hasPrev, hasNext }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('query')

  return (
    <div className={styles.container}>
      <button 
        className={styles.button}
        disabled={!hasPrev}
        onClick={() => router.push(`?query=${encodeURIComponent(query)}&page=${page - 1}`)}
      >
        Previous
      </button>
      <button 
        className={styles.button}
        disabled={!hasNext}
        onClick={() => router.push(`?query=${encodeURIComponent(query)}&page=${page + 1}`)}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination

"use client";
import { useState } from "react";
import styles from "./summarizeButton.module.css";

const SummarizeButton = ({ postContent, postTitle, onChatToggle, isChatOpen }) => {
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Safe HTML text extraction without creating DOM elements
  const extractTextFromHTML = (html) => {
    if (!html) return '';
    
    try {
      // Use DOMParser instead of createElement to avoid DOM manipulation issues
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || doc.body.innerText || '';
      } else {
        // Fallback: simple regex-based tag removal
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch (error) {
      console.warn('Failed to extract text from HTML, using fallback:', error);
      // Fallback: simple regex-based tag removal
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  };

  const handleSummarize = async () => {
    setLoadingSummary(true);
    setShowSummary(true);

    try {
      // Extract text content from HTML using safe method
      let textContent = extractTextFromHTML(postContent);
      
      // Truncate text if it's too long
      const MAX_CHARS = 8000;
      if (textContent.length > MAX_CHARS) {
        textContent = textContent.substring(0, MAX_CHARS) + "...";
      }
      
      const res = await fetch('/api/summarize', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleText: textContent }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        if (result.error === "API key not configured") {
          throw new Error("Summarization service is not properly configured. Please contact the administrator.");
        }
        throw new Error(result.error || "Failed to generate summary");
      }
      
      setSummary(result.summary || "Could not generate summary");
    } catch (error) {
      console.error("Summarization error:", error);
      setSummary(`Error: ${error.message || "Failed to generate summary. Please try again."}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChatPromptClick = () => {
    if (onChatToggle) {
      onChatToggle(true);
    }
  };

  return (
    <>
      <button 
        className={styles.summariseBtn} 
        onClick={handleSummarize} 
        disabled={loadingSummary}
        aria-label={loadingSummary ? "Generating summary..." : "Generate article summary"}
        role="button"
      >
        {loadingSummary ? (
          <span className={styles.loadingText}>
            Generating summary
            <span className={styles.loadingDots}>
              <span>.</span><span>.</span><span>.</span>
            </span>
          </span>
        ) : (
          "Summarize Blog"
        )}
      </button>

      {showSummary && (
        <div className={styles.summaryBox} role="region" aria-label="Article summary">
          {loadingSummary ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Generating summary...</p>
            </div>
          ) : (
            <p>{summary}</p>
          )}
        </div>
      )}

      {showSummary && !loadingSummary && summary && !isChatOpen && (
        <div className={styles.chatPrompt} onClick={handleChatPromptClick}>
          <div className={styles.botIcon}>🤖</div>
          <span>Wanna discuss about the article?</span>
        </div>
      )}
    </>
  );
};

export default SummarizeButton; 
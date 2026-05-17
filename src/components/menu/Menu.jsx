"use client";
import React, { useState, useEffect, useRef } from 'react'
import styles from "./menu.module.css"
import MenuPosts from '../menuPosts/MenuPosts'
import MenuCategories from '../menuCategories/MenuCategories'
import SummarizeButton from "@/components/summarizeButton/SummarizeButton"
import ChatBot from "@/components/chatBot/ChatBot"

const Menu = ({ articleContent, articleTitle }) => {
  const [showChatInSidebar, setShowChatInSidebar] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // When cursor is on LEFT and page scrolls, sync sidebar scroll proportionally
    const handlePageScroll = () => {
      const maxSidebarScroll = el.scrollHeight - el.clientHeight;
      if (maxSidebarScroll <= 0) return;
      const maxPageScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxPageScroll <= 0) return;
      el.scrollTop = (window.scrollY / maxPageScroll) * maxSidebarScroll;
    };

    window.addEventListener('scroll', handlePageScroll, { passive: true });
    return () => window.removeEventListener('scroll', handlePageScroll);
  }, []);

  const handleChatToggle = (isOpen) => {
    setShowChatInSidebar(isOpen);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Article-specific features: Summarize Button and Chat */}
      {articleContent && articleTitle && (
        <div className={styles.articleFeatures}>
          <SummarizeButton 
            postContent={articleContent} 
            postTitle={articleTitle}
            onChatToggle={handleChatToggle}
            isChatOpen={showChatInSidebar}
          />
          
          {showChatInSidebar && (
            <ChatBot 
              articleContent={articleContent} 
              articleTitle={articleTitle}
              onChatToggle={handleChatToggle}
            />
          )}
        </div>
      )}

      {/* Regular menu content */}
      <h2 className={styles.subtitle}>{"What's hot"}</h2>
      <h1 className={styles.title}>Most Popular</h1>
      <MenuPosts withImage={false} type="most-viewed" />
      <h2 className={styles.subtitle}>Discover by topic</h2>
      <h1 className={styles.title}>Categories</h1>
      <MenuCategories />
      <h2 className={styles.subtitle}>Chosen by the editor</h2>
      <h1 className={styles.title}>Editors Pick</h1>
      <MenuPosts withImage={true} type="random" />
    </div>
  );
}

export default Menu;

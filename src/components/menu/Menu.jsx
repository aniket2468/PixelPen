"use client";
import React, { useState } from 'react'
import styles from "./menu.module.css"
import MenuPosts from '../menuPosts/MenuPosts'
import MenuCategories from '../menuCategories/MenuCategories'
import SummarizeButton from "@/components/summarizeButton/SummarizeButton"
import ChatBot from "@/components/chatBot/ChatBot"

const Menu = ({ articleContent, articleTitle }) => {
  const [showChatInSidebar, setShowChatInSidebar] = useState(false);

  const handleChatToggle = (isOpen) => {
    setShowChatInSidebar(isOpen);
  };

  return (
    <div className={styles.container}>
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

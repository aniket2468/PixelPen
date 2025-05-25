"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCalendar,
  faNewspaper,
  faComment,
  faEye,
  faArrowLeft,
  faUserSlash
} from '@fortawesome/free-solid-svg-icons';
import styles from './profile.module.css';

const ProfilePage = () => {
  const params = useParams();
  const username = params.username?.startsWith('@') ? params.username.slice(1) : params.username;
  
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalViews: 0,
    memberSince: null
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userResponse = await fetch(`/api/user/profile/${username}`);
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to fetch user profile');
        }
        return;
      }
      
      const userData = await userResponse.json();
      setUser(userData.user);
      setUserStats(userData.stats);
      setRecentPosts(userData.recentPosts || []);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username, fetchUserProfile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    
    // Remove HTML tags
    const stripped = html.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = stripped;
    const decoded = textarea.value;
    
    return decoded;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <FontAwesomeIcon icon={faUserSlash} className={styles.errorIcon} />
          <h2>Profile Not Found</h2>
          <p>{error}</p>
          <Link href="/" className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <Link href="/" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Home
        </Link>
        
        <div className={styles.profileInfo}>
          <div className={styles.avatarSection}>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={120}
                height={120}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
          </div>
          
          <div className={styles.userDetails}>
            <h1 className={styles.displayName}>{user.name}</h1>
            <p className={styles.username}>@{user.username}</p>
            <div className={styles.memberSince}>
              <FontAwesomeIcon icon={faCalendar} />
              <span>Member since {formatDate(userStats.memberSince)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsSection}>
        <h2>Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FontAwesomeIcon icon={faNewspaper} className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{userStats.totalPosts}</span>
              <span className={styles.statLabel}>Posts Written</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <FontAwesomeIcon icon={faComment} className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{userStats.totalComments}</span>
              <span className={styles.statLabel}>Comments</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <FontAwesomeIcon icon={faEye} className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{formatViews(userStats.totalViews)}</span>
              <span className={styles.statLabel}>Total Views</span>
            </div>
          </div>
        </div>
      </div>

      {recentPosts.length > 0 && (
        <div className={styles.postsSection}>
          <h2>Recent Posts</h2>
          <div className={styles.postsList}>
            {recentPosts.map((post) => (
              <Link href={`/posts/${post.slug}`} key={post.id} className={styles.postCard}>
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postDesc}>{stripHtmlTags(post.desc)}</p>
                  <div className={styles.postMeta}>
                    <span className={styles.postDate}>
                      {formatDate(post.createdAt)}
                    </span>
                    <span className={styles.postViews}>
                      <FontAwesomeIcon icon={faEye} />
                      {formatViews(post.views)}
                    </span>
                  </div>
                </div>
                {post.img && (
                  <div className={styles.postImage}>
                    <Image
                      src={post.img}
                      alt={post.title}
                      width={100}
                      height={100}
                      className={styles.postImg}
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
          
          {recentPosts.length === 5 && (
            <div className={styles.viewMore}>
              <Link href={`/blog?user=${user.email}`} className={styles.viewMoreButton}>
                View All Posts
              </Link>
            </div>
          )}
        </div>
      )}

      {recentPosts.length === 0 && (
        <div className={styles.noPosts}>
          <FontAwesomeIcon icon={faNewspaper} className={styles.noPostsIcon} />
          <h3>No Posts Yet</h3>
          <p>{user.name} hasn&apos;t written any posts yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 
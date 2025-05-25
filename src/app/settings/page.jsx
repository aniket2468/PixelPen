"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faCamera, 
  faEdit, 
  faSave, 
  faTimes, 
  faEye,
  faComment,
  faNewspaper,
  faCalendar,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import styles from './settings.module.css';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '@/utils/firebase';

const ProfileSettings = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    image: ''
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalViews: 0,
    memberSince: null
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      setFormData({
        name: session.user.name || '',
        username: session.user.username || '',
        email: session.user.email || '',
        image: session.user.image || ''
      });
      setPreviewImage(session.user.image || '');
      fetchUserStats();
    }
  }, [status, session, router]);

  const uploadImageToFirebase = async (file, userEmail) => {
    if (!file || !userEmail) return null;

    const storage = getStorage(app);
    const fileName = `profiles/${userEmail}-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring could be added here
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          }).catch(reject);
        }
      );
    });
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file.' });
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
        return;
      }

      setFile(selectedFile);
      setMessage({ type: 'info', text: 'Image selected. Click "Save Changes" to upload.' });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below.' });
      return;
    }

    setLoading(true);
    setImageUploading(true);
    setMessage({ type: '', text: '' }); // Clear any existing messages

    try {
      let imageUrl = formData.image; // Keep existing image by default
      
      // Upload new image if file is selected
      if (file) {
        try {
          imageUrl = await uploadImageToFirebase(file, session.user.email);
          // Don't show intermediate success message - wait for profile update
        } catch (error) {
          console.error('Image upload failed:', error);
          setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
          setLoading(false);
          setImageUploading(false);
          return;
        }
      }

      // Update profile with new image URL
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the session without causing a page refresh
        try {
          // Only update session if there are actual changes
          const sessionNeedsUpdate = 
            session.user.name !== updatedUser.name ||
            session.user.username !== updatedUser.username ||
            session.user.image !== updatedUser.image;
            
          if (sessionNeedsUpdate) {
            await update({
              ...session,
              user: {
                ...session.user,
                name: updatedUser.name,
                username: updatedUser.username,
                image: updatedUser.image
              }
            });
          }
        } catch (sessionError) {
          // If session update fails, continue anyway - it's not critical
          console.warn('Session update failed:', sessionError);
        }

        // Update local form data to reflect the saved changes
        setFormData(prev => ({
          ...prev,
          name: updatedUser.name,
          username: updatedUser.username,
          image: updatedUser.image
        }));

        setPreviewImage(updatedUser.image || '');
        setFile(null); // Clear the file input
        
        // Also clear the actual file input element
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Show single success message based on what was updated
        const successMessage = file ? 'Profile and image updated successfully!' : 'Profile updated successfully!';
        setMessage({ type: 'success', text: successMessage });
        setIsEditing(false);
        
        // Refetch user stats to ensure everything is up to date
        fetchUserStats();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }

    setLoading(false);
    setImageUploading(false);
  };

  const handleCancel = () => {
    // Reset form to original session data
    setFormData({
      name: session.user.name || '',
      username: session.user.username || '',
      email: session.user.email || '',
      image: session.user.image || ''
    });
    setPreviewImage(session.user.image || '');
    setFile(null);
    setIsEditing(false);
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Profile Settings</h3>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          <FontAwesomeIcon icon={
            message.type === 'success' ? faCheck : 
            message.type === 'error' ? faExclamationTriangle :
            message.type === 'info' ? faCamera :
            faExclamationTriangle
          } />
          <span>{message.text}</span>
        </div>
      )}

      <div className={styles.content}>
        {/* Profile Picture and Stats */}
        <div className={styles.sidebar}>
          <div className={styles.profileSection}>
            <div className={styles.profileImageContainer}>
              <div className={styles.profileImageWrapper} onClick={handleImageClick}>
                <Image
                  src={previewImage || '/default-avatar.png'}
                  alt="Profile Picture"
                  className={styles.profileImage}
                  width={120}
                  height={120}
                />
                {isEditing && (
                  <div className={styles.imageOverlay}>
                    {imageUploading ? (
                      <div className={styles.uploadingSpinner}></div>
                    ) : (
                      <FontAwesomeIcon icon={faCamera} />
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{formData.name || 'No name set'}</h2>
              <p className={styles.profileUsername}>
                {formData.username ? `@${formData.username}` : 'No username set'}
              </p>
              <p className={styles.profileEmail}>{formData.email}</p>
            </div>
          </div>

          {/* User Statistics */}
          <div className={styles.statsSection}>
            <h3 className={styles.statsTitle}>Your Statistics</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <FontAwesomeIcon icon={faNewspaper} className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{userStats.totalPosts}</span>
                  <span className={styles.statLabel}>Posts Written</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FontAwesomeIcon icon={faComment} className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{userStats.totalComments}</span>
                  <span className={styles.statLabel}>Comments Made</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FontAwesomeIcon icon={faEye} className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{userStats.totalViews}</span>
                  <span className={styles.statLabel}>Total Views</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FontAwesomeIcon icon={faCalendar} className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {userStats.memberSince ? new Date(userStats.memberSince).getFullYear() : 'N/A'}
                  </span>
                  <span className={styles.statLabel}>Member Since</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className={styles.mainContent}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Account Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Profile
                </button>
              ) : (
                <div className={styles.actionButtons}>
                  <button
                    onClick={handleCancel}
                    className={styles.cancelButton}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={styles.saveButton}
                    disabled={loading || imageUploading}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {imageUploading ? 'Uploading Image...' : loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  <FontAwesomeIcon icon={faUser} />
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  disabled={!isEditing}
                  placeholder="Enter your display name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>
                  <FontAwesomeIcon icon={faUser} />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.username ? styles.error : ''}`}
                  disabled={!isEditing}
                  placeholder="Choose a unique username"
                />
                {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                {!errors.username && formData.username && (
                  <span className={styles.helpText}>
                    Your profile will be available at: /profile/{formData.username}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className={`${styles.input} ${styles.disabled}`}
                  disabled
                  placeholder="Email cannot be changed"
                />
                <span className={styles.helpText}>
                  Email address cannot be changed for security reasons
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
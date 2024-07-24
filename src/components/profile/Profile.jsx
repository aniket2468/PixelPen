"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './profile.module.css';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '@/utils/firebase';

const Profile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session) {
      setName(session.user.name || '');
      setProfilePic(session.user.image || '/default-profile.png');
    }
  }, [status, session, router]);

  useEffect(() => {
    const uploadImage = () => {
      if (!file) return;

      const storage = getStorage(app);
      const fileName = `${session.user.email}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => {
          setLoading(true);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setProfilePic(downloadURL);
            setLoading(false);
          });
        }
      );
    };

    uploadImage();
  }, [file, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        image: profilePic,
      }),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      router.reload();
    } else {
      console.error('Failed to update profile');
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Profile</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.profilePicContainer}>
          <Image
            src={profilePic}
            alt="Profile Picture"
            className={styles.profilePic}
            width={100}
            height={100}
          />
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;

"use client"
import React, { useEffect } from 'react';
import styles from './loginPage.module.css';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.socialButton} onClick={() => signIn('google', { callbackUrl })}>
          Sign in with Google
        </div>
        <div className={styles.socialButton} onClick={() => signIn('github', { callbackUrl })}>
          Sign in with GitHub
        </div>
        <div className={styles.socialButton} onClick={() => signIn('facebook', { callbackUrl })}>
          Sign in with Facebook
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

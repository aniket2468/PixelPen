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
  const error = searchParams.get('error');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return <div className={styles.loading}>Loading...</div>;
  }

  const getErrorMessage = (error) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL. Please try again.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create your account. This might be due to a database issue or username conflict. Please try again, or contact support if the problem persists.';
      case 'EmailCreateAccount':
        return 'Could not create account with email. Please try again.';
      case 'Callback':
        return 'Error in the OAuth callback handler route. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'The email on the account is already linked to another account. Please sign in with the same provider you used originally.';
      case 'EmailSignin':
        return 'Error sending the verification email. Please try again.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'You must be signed in to view this page.';
      default:
        return 'Authentication error. Please clear your cookies and try again.';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {error && (
          <div className={styles.errorMessage}>
            <h3>Sign In Error</h3>
            <p>{getErrorMessage(error)}</p>
          </div>
        )}
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

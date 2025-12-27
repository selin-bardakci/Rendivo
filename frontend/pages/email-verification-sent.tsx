import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/emailVerification.module.css';

export default function EmailVerificationSent() {
  const router = useRouter();
  const { email } = router.query;
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email has been resent successfully!');
      } else {
        setMessage(data.message || 'Failed to resend email. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className={styles.title}>Check Your Email</h1>
        
        <p className={styles.description}>
          We've sent a verification link to{' '}
          <span className={styles.email}>{email || 'your email address'}</span>
        </p>

        <div className={styles.infoBox}>
          <p>
            <strong>What's next?</strong><br />
            Click the verification link in your email to activate your account. 
            The link will expire in 24 hours.
          </p>
        </div>

        <p className={styles.description} style={{ fontSize: '14px', marginTop: '16px' }}>
          Can't find the email? Check your spam folder or request a new one below.
        </p>

        <Link href="/" className={styles.button}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Homepage
        </Link>

        <div className={styles.resendSection}>
          <p>Didn't receive the email?</p>
          <button
            onClick={handleResendEmail}
            disabled={resending || !email}
            className={styles.resendButton}
          >
            {resending ? (
              <>
                <span className={styles.loader}></span>
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </button>
          
          {message && (
            <div className={message.includes('success') ? styles.success : styles.error} style={{ marginTop: '16px' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

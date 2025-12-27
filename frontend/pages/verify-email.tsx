import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/emailVerification.module.css';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Start countdown
          let count = 3;
          const interval = setInterval(() => {
            count -= 1;
            setCountdown(count);
            
            if (count === 0) {
              clearInterval(interval);
              router.push('/login');
            }
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <div className={styles.loader}></div>
          </div>
          <h1 className={styles.title}>Verifying Your Email</h1>
          <p className={styles.description}>Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className={styles.title}>Verification Failed</h1>
          <p className={styles.description}>{message}</p>

          <div className={styles.infoBox}>
            <p>
              The verification link may have expired or is invalid. 
              Please request a new verification email or contact support if the problem persists.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <a href="/login" className={styles.button} style={{ background: 'white', color: '#886385', border: '2px solid #886385' }}>
              Go to Login
            </a>
            <a href="/" className={styles.button}>
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.successIcon} style={{ width: '40px', height: '40px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className={styles.title}>Email Verified!</h1>
        <p className={styles.description}>{message}</p>

        <div className={styles.infoBox}>
          <p>
            <strong>Success!</strong><br />
            Your account is now active. You can now log in and start using Rendivo.
          </p>
        </div>

        <div className={styles.redirecting}>
          <div className={styles.loader}></div>
          <p>Redirecting to login page in {countdown} seconds...</p>
        </div>

        <a href="/login" className={styles.button} style={{ marginTop: '24px' }}>
          Go to Login Now
        </a>
      </div>
    </div>
  );
}

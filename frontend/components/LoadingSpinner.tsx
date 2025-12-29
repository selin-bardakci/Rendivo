import styles from '../styles/LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
}

export default function LoadingSpinner({ text = 'Loading', size = 'medium' }: LoadingSpinnerProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  )
}

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { initFirebase } from '../lib/firebase'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Firebase when app starts
    initFirebase()
  }, [])

  return <Component {...pageProps} />
}

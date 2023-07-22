"use client";

import { PropsWithChildren } from 'react'
import Header from './Header'
import UserProvider from '@/context/userContext';
import styles from '../app/page.module.css'
 
export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <UserProvider>
        <Header />
        <main className={styles.main}>
          {children}
        </main>
      </UserProvider>
    </>
  )
}
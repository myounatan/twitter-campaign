"use client";

import { PropsWithChildren } from 'react'
import Header from './Header'
import UserProvider from '@/context/userContext';
import styles from '../app/page.module.css'

import { SnackbarProvider } from 'notistack';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <UserProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
          <Header />
          <main className={styles.main}>
            {children}
          </main>
        </SnackbarProvider>
      </UserProvider>
    </>
  )
}
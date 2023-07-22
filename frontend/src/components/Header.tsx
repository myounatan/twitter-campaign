"use client";

import 'dotenv/config'

import Image from 'next/image'
import styles from '../app/page.module.css'
import { AppBar, Box, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useState, useContext } from 'react';

import Link from 'next/link'
import { usePathname } from 'next/navigation';

// use context userContext.tsx
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';

export default function Header() {
  const { account, loadingLogin, isLoggedIn, login, logout } = useContext(UserContext) as UserContextType;

  const currentRoute = usePathname();

  return (
    <AppBar position="static">
      <Toolbar>
        <Stack spacing={2} direction="row">
        <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <Button variant={currentRoute == '/' ? "outlined" : "text"} color="inherit">
            <Typography variant="body1" color="inherit">
              <Link href="/">Campaigns</Link>
            </Typography>
          </Button>
          <Button variant={currentRoute == '/history' ? "outlined" : "text"} color="inherit">
            <Typography variant="body1" color="inherit">
              <Link href="/history">All Reward History</Link>
            </Typography>
          </Button>
        </Stack>
        <Box component="div" sx={{ flexGrow: 1 }}>
        </Box>
            <Stack spacing={2} direction="row">
        {isLoggedIn && (
          <Button variant="outlined" color="inherit">
            <Typography variant="body1" color="inherit">
              <Link href="/account">My Account</Link>
            </Typography>
          </Button>
        )}
        {isLoggedIn ? (
          <Button variant="outlined" color="inherit" onClick={logout}>
            <Stack spacing={2} direction="row">
              <Typography variant="body1" color="inherit">
                Logout
              </Typography>
              <Image
                className={styles.twitterprofilepic}
                src={account?.profileImage || '/twitter-48.png'}
                alt="Twitter Login Logo"
                width={25}
                height={25}
                priority
              />
            </Stack>
          </Button>
        ) : (
          <Button variant="outlined" color="inherit" onClick={login} disabled={loadingLogin}>
            <Stack spacing={2} direction="row">
              <Typography variant="body1" color="inherit">
                Login
              </Typography>
              <Image
                src="/twitter-48.png"
                alt="Twitter Login Logo"
                width={25}
                height={25}
                priority
              />
            </Stack>
          </Button>
        )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
"use client";

import 'dotenv/config'

import Image from 'next/image'
import styles from '../app/page.module.css'
import { AppBar, Box, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useState, useContext } from 'react';

// use context userContext.tsx
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';

export default function Header() {
  const { account, loadingLogin, isLoggedIn, login, logout } = useContext(UserContext) as UserContextType;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" className={styles.logo}>
          Twitter Campaigns
        </Typography>
        <Typography variant="h6" color='#000000'>
        &nbsp;- Create and participate in on-chain twitter marketing campaigns
        </Typography>

        <Box component="div" sx={{ flexGrow: 1 }}/>

        <Stack spacing={2} direction="row">
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
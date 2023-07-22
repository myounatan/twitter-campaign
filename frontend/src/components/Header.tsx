"use client";

import 'dotenv/config'

import Image from 'next/image'
import styles from '../app/page.module.css'
import { AppBar, Box, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useState, useContext } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

// use context userContext.tsx
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';

export default function Header() {
  const { account, loadingLogin, isLoggedIn, login, logout } = useContext(UserContext) as UserContextType;

  return (
    <AppBar position="fixed" style={{ background: '#425787'}}>
      <Toolbar>
        <Stack spacing={0} direction="column" marginTop={0.5}>
          <Typography variant="h4" color='#ffffff' className={styles.appbar}>
            Twitter Campaigns
          </Typography>
          <Typography variant="h6" color='#ffffff' className={styles.appbar}>
            Create and participate in on-chain twitter marketing campaigns
          </Typography>
        </Stack>

        <Box component="div" sx={{ flexGrow: 1 }}/>

        <Stack spacing={2} direction="row">
          {isLoggedIn ? (
            <Button variant="contained" onClick={logout}>
              <Stack spacing={1} direction="row">
                <Image
                  className={styles.twitterprofilepic}
                  src={account?.profileImage || '/twitter-48.png'}
                  alt="Twitter Login Logo"
                  width={25}
                  height={25}
                  priority
                />
                <Typography variant="body1" color="inherit" textTransform='lowercase'>
                  @{account?.twitterHandle}
                </Typography>
                <LogoutIcon/>
              </Stack>
            </Button>
          ) : (
            <Button variant="contained" onClick={login} disabled={loadingLogin}>
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
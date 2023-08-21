"use client";

import styles from '../app/page.module.css'
import { Box, Button, Stack } from '@mui/material';
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';
import { useContext } from 'react';
import { ethers } from 'ethers';

export default function AccountSummary() {
  const { account, loadingLogin, isLoggedIn, fundTransak, convertMaticUSD } = useContext(UserContext) as UserContextType;

  if (!isLoggedIn) {
    return (
      <>
        <div className={styles.description}>
          <Stack spacing={2} direction="column">
            <div>
              ACCOUNT SUMMARY
            </div>
            <p>
              {loadingLogin ? 'Loading..' : 'Log in to view account summary'}
            </p>
          </Stack>
        </div>
      </>
    )
  }

  return (
    <>
        <div className={styles.description}>
          <Stack spacing={2} direction="column">
            <div>
              ACCOUNT SUMMARY
            </div>
            <Stack spacing={2} direction="row">
              <p>
                Wallet&nbsp;
                <code className={styles.code}>{account?.wallet}</code>
              </p>
              <p>
                Balance&nbsp;
                <code className={styles.code}>{`${convertMaticUSD(ethers.utils.parseEther(account?.balance || '0'))} (${account?.balance} MATIC)`}</code>
              </p>
              {isLoggedIn && (
                <Button variant="outlined" color="inherit" onClick={fundTransak}>
                  Fund with Transak
                </Button>
              )}
            </Stack>
            
          </Stack>
        </div>
    </>
  )
}
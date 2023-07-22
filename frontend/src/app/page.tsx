"use client";

import Image from 'next/image'
import styles from './page.module.css'
import Layout from '@/components/Layout';
import { Box, Stack } from '@mui/material';
import AccountSummary from '@/components/AccountSummary';
import CampaignList from '@/components/CampaignList';
import RewardLogList from '@/components/RewardLogList';

export default function Home() {
  return (
    <Layout>
      <Stack spacing={5} direction="column">
        <AccountSummary/>

        <CampaignList/>

        <RewardLogList/>
      </Stack>
    </Layout>
  )
}

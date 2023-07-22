"use client";

import 'dotenv/config';

import styles from '../app/page.module.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';

// campaign type
import { GET_SORTED_REWARDLOGS, queryApollo } from '@/services/graphql.service';
import { ethers, BigNumber } from 'ethers';
import { setSyntheticTrailingComments } from 'typescript';
import { RewardLog } from '@/types/rewardLog';


const getTweetAuthorTwitterHandle = async (tweetId: number) => {
  const res = await fetch('/api/tweetauthor', {
    method: 'POST',
    body: JSON.stringify({ tweetId: `${tweetId}` }),
  });

  console.log(res)

  if (res.status === 200) {
    const data = await res.json();
    console.log(`Received twitter handle ${data.twitterHandle}`);
    console.log(`Received twitter user id ${data.twitterUserId}`);

    return data.twitterHandle;
  } else {
    throw new Error('no twitter handle');
  }
}


export default function RewardLogList() {

  const [rewardLogs, setRewardLogs] = useState<[RewardLog] | []>([]);


  // use graphql.service to get campaigns
  const fetchData = useCallback(async () => {
    const data = await queryApollo(GET_SORTED_REWARDLOGS, { first: 20 })
  
    console.log('data.rewardLogs', data.rewardLogs)

    // map tokensRewarded formatEther
    // for each rewardLog, get twitter handle from twitterUserId
    // and format rewardsRewarded using formatEther

    const mapped = await Promise.all<[RewardLog]>(data.rewardLogs.map(async (rewardLog: RewardLog) => {
      const twitterHandle = await getTweetAuthorTwitterHandle(rewardLog.tweetId);
      const tokensRewarded = ethers.utils.formatEther(rewardLog.tokensRewarded);

      return {
        ...rewardLog,
        twitterHandle: twitterHandle,
        tokensRewarded: tokensRewarded
      }
    }))

    console.log('mapped', mapped)

    setRewardLogs(mapped);
  }, [])
  
  useEffect(() => {
    fetchData()
      .catch(console.error);;
  }, [fetchData])


  

  // map campaigns to grid items
  return (
    <>
        <div>
          <Stack spacing={2} direction="column">
            <div className={styles.description}>
              REWARD LOGS
            </div>
            
            <div>
                {rewardLogs.map((log: RewardLog) => (
                  <Grid item key={log.id} className={styles.card}>
                      <div>
                        <Stack spacing={2} direction="column">
                        <p>
                          <code className={styles.code}>
                            wallet:&nbsp;{log.wallet}
                          </code>
                          {'\n'}
                          <code className={styles.code}>
                            @{log.twitterHandle}
                          </code>
                        </p>
                        <h3>
                          {log.tokensRewarded}
                        </h3>
                        </Stack>
                      </div>
                  </Grid>
                ))}
            </div>
            
          </Stack>
        </div>
    </>
  )
}
"use client";

import 'dotenv/config';

import styles from '../app/page.module.css';
import { Grid, Stack } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';

// campaign type
import { GET_SORTED_REWARDLOGS, queryApollo } from '@/services/graphql.service';
import { BigNumber, ethers } from 'ethers';
import { RewardLog } from '@/types/rewardLog';
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';


export default function RewardLogList() {
  const { getTweetAuthorTwitterHandle, convertMaticUSD } = useContext(UserContext) as UserContextType;

  const [rewardLogs, setRewardLogs] = useState<[RewardLog] | []>([]);

  const [refreshTime, setRefreshTime] = useState(Date.now());

  // use graphql.service to get campaigns
  const fetchData = useCallback(async () => {
    const data = await queryApollo(GET_SORTED_REWARDLOGS, { first: 20 })
  
    console.log('data.rewardLogs', data.rewardLogs)

    // map tokensRewarded formatEther
    // for each rewardLog, get twitter handle from twitterUserId
    // and format rewardsRewarded using formatEther

    const mapped = await Promise.all<[RewardLog]>(data.rewardLogs.map(async (rewardLog: RewardLog) => {
      const twitterHandle = await getTweetAuthorTwitterHandle(rewardLog.tweetId);

      return {
        ...rewardLog,
        twitterHandle: `${twitterHandle}`,
        tokensRewardedFormatted: ethers.utils.formatEther(rewardLog.tokensRewarded)
      }
    }))

    console.log('mapped', mapped)

    setRewardLogs(mapped);
  }, [refreshTime])
  
  useEffect(() => {
    fetchData()
      .catch(console.error);
  }, [fetchData])
  
  useEffect(() => {
    fetchData()
      .catch(console.error);
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setRefreshTime(Date.now()), 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  

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
                  <Grid item key={log.id} marginBottom={1} className={styles.card}>
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
                          {`${convertMaticUSD(BigNumber.from(log.tokensRewarded).toNumber())} (${log.tokensRewardedFormatted} GETH) rewarded`}
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
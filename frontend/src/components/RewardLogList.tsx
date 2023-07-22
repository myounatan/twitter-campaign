"use client";

import 'dotenv/config';

import styles from '../app/page.module.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';
import { useCallback, useContext, useEffect, useState } from 'react';

// campaign type
import { GET_SORTED_REWARDLOGS, queryApollo } from '@/services/graphql.service';
import { ethers, BigNumber } from 'ethers';
import { setSyntheticTrailingComments } from 'typescript';
import { RewardLog } from '@/types/rewardLog';



export default function RewardLogList() {

  const [rewardLogs, setRewardLogs] = useState<[RewardLog] | []>([]);


  // use graphql.service to get campaigns
  const fetchData = useCallback(async () => {
    const data = await queryApollo(GET_SORTED_REWARDLOGS, { first: 20 })
  
    console.log(data.rewardLogs)

    // map tokensRewarded formatEther
    const mapped = data.rewardLogs.map((rewardLog: RewardLog) => {
      return {
        ...rewardLog,
        tokensRewarded: ethers.utils.formatEther(rewardLog.tokensRewarded),
      }
    })

    setRewardLogs(mapped);
  }, [])
  
  useEffect(() => {
    fetchData()
      .catch(console.error);;
  }, [fetchData])


  

  // map campaigns to grid items
  return (
    <>
        <div className={styles.description}>
          <Stack spacing={2} direction="column">
            <div>
              REWARD LOGS
            </div>
            

            {/* <>
              <Stack spacing={2} direction="row" className={styles.grid}>
                {campaigns.map((campaign: Campaign) => (
                  <Grid item key={campaign.campaignId}>
                      <div className={styles.card}>
                        <Stack spacing={2} direction="column">
                        <h2>
                          {campaign.name}
                        </h2>
                        <>{campaign.description}</>
                        <p>
                          Tweet must contain&nbsp;
                          <code className={styles.code}>{campaign.tweetString}</code>
                        </p>
                        <p>
                          Tokens per like&nbsp;
                          <code className={styles.code}>{campaign.tokensPerLike}</code>
                        </p>
                        <p>
                          Tokens per retweet&nbsp;
                          <code className={styles.code}>{campaign.tokensPerRetweet}</code>
                        </p>
                        <code className={styles.code}> Total Rewards Left: {ethers.utils.formatEther(campaign.rewardsLeft)}</code>
                          <Stack spacing={2} direction="column">
                            <TextField
                              margin="dense"
                              id={`tweetid-${campaign.campaignId}`}
                              label="TweetId"
                              placeholder='123456..'
                              type="float"
                              variant="outlined"
                              onChange={(e) => setFormFunds(e.target.value)}
                            />
                            {isLoggedIn ? (
                              <Button variant="outlined" color="inherit" id={`claimreward-${campaign.campaignId}`}>
                                Claim Reward
                              </Button>
                            ) : (
                              <p>
                                {loadingLogin ? 'Loading..' : 'Log in to claim rewards'}
                              </p>
                            )}
                          </Stack>
                        </Stack>
                      </div>
                  </Grid>
                ))}
              </Stack>
            </> */}
            
          </Stack>
        </div>
    </>
  )
}
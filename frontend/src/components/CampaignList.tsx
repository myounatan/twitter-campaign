"use client";

import 'dotenv/config';

import styles from '../app/page.module.css';
import { Alert, AlertTitle, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { UserContext } from '@/context/userContext';
import { UserContextType } from '@/types/user';
import { useCallback, useContext, useEffect, useState } from 'react';

// campaign type
import { Campaign } from '@/types/campaign';
import { GET_CAMPAIGNS, queryApollo } from '@/services/graphql.service';
import { ethers, BigNumber } from 'ethers';

import { useSnackbar } from 'notistack';

import CircularProgress from '@mui/material/CircularProgress';


export default function CampaignList() {
  // context
  const { account, signature, loadingLogin, isLoggedIn, signer, getTwitterHandleFromId, updateBalance, convertMaticUSD } = useContext(UserContext) as UserContextType;
  const { enqueueSnackbar } = useSnackbar();

  // campaign states
  const [campaigns, setCampaigns] = useState<[Campaign] | []>([]);

  const [formOpen, setFormOpen] = useState(false);

  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const [loadingOpenAI, setLoadingOpenAI] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTweetString, setFormTweetString] = useState('');
  const [formFunds, setFormFunds] = useState('');
  const [formTokensPerLike, setFormTokensPerLike] = useState('');
  const [formTokensPerRetweet, setFormTokensPerRetweet] = useState('');

  const [showFormError, setShowFormError] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const [refreshTime, setRefreshTime] = useState(Date.now());

  // reward claim states
  const [claimingReward, setClaimingReward] = useState(false);
  const [currentClaimRewardCampaignId, setCurrentClaimRewardCampaignId] = useState('');

  // use graphql.service to get campaigns
  const fetchData = useCallback(async () => {
    const data = await queryApollo(GET_CAMPAIGNS, { first: 10 })
  
    console.log(data.campaigns)

    // map tokensPerLike and tokensPerRetweet with ethers.utils.formatEther
    // const mapped = data.campaigns.map((campaign: Campaign) => {
    //   return {
    //     ...campaign,
    //     tokensPerLike: ethers.utils.formatEther(campaign.tokensPerLike),
    //     tokensPerRetweet: ethers.utils.formatEther(campaign.tokensPerRetweet),
    //   }
    // })

    const mapped = await Promise.all<[Campaign]>(data.campaigns.map(async (campaign: Campaign) => {
      const tokensPerLike = `${convertMaticUSD(campaign.tokensPerLike)} (${ethers.utils.formatEther(campaign.tokensPerLike)} MATIC)`;
      const tokensPerRetweet = `${convertMaticUSD(campaign.tokensPerRetweet)} (${ethers.utils.formatEther(campaign.tokensPerRetweet)} MATIC)`;
      let twitterHandle = '';
      try {
        twitterHandle = await getTwitterHandleFromId(campaign.ownerTwitterUserId);
      } catch (error) {
        console.log(error);
      }

      return {
        ...campaign,
        tokensPerLike: tokensPerLike,
        tokensPerRetweet: tokensPerRetweet,
        ownerTwitterHandle: twitterHandle
      }
    }))

    setCampaigns(mapped);
  }, [refreshTime])
  
  useEffect(() => {
    fetchData()
      .catch(console.error);
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => setRefreshTime(Date.now()), 4000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleClickOpen = () => {
    setFormOpen(true);
  };

  const handleClose = (event?: any, reason?: string) => {
    if (reason && reason == "backdropClick") 
        return;

    // reset form variables
    setFormName('');
    setFormDescription('');
    setFormTweetString('');
    setFormFunds('');
    setFormTokensPerLike('');
    setFormTokensPerRetweet('');
        
    setShowFormError(false);
    setFormErrorMessage('');
    setFormOpen(false);
  };

  const handleClickOpenAI = async () => {
    // use api/openai to generate prompt with body.prompt text from form-ai-prompt element

    try {
      setLoadingOpenAI(true);

      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: (document.getElementById('form-ai-prompt') as HTMLInputElement).value }),
      });

      console.log(res)

      setLoadingOpenAI(false);

      if (res.status === 200) {
        const data = await res.json();

        if (data.campaignCopy === undefined) {
          throw new Error('no generated prompt');
        }

        console.log(`Received generated copy ${data.campaignCopy}`);

        // check if any of the fields are undefined as string or literal, and throw error
        if (data.campaignCopy.title === undefined || data.campaignCopy.description === undefined || data.campaignCopy.hashtag === undefined) {
          throw new Error('no generated prompt');
        }
        if (data.campaignCopy.title === 'undefined' || data.campaignCopy.description === 'undefined' || data.campaignCopy.hashtag === 'undefined') {
          throw new Error('no generated prompt');
        }

        setFormName(data.campaignCopy.title);
        setFormDescription(data.campaignCopy.description);
        setFormTweetString(data.campaignCopy.hashtag);

        // set element values
        (document.getElementById('form-name') as HTMLInputElement).value = data.campaignCopy.title;
        (document.getElementById('form-description') as HTMLInputElement).value = data.campaignCopy.description;
        (document.getElementById('form-tweetstring') as HTMLInputElement).value = data.campaignCopy.hashtag;
        
        enqueueSnackbar(`Successfully generated prompt using OpenAI`, { variant: 'success' });
      } else {
        throw new Error('no generated prompt');
      }
    } catch (error: any) {
      console.log(error);

      enqueueSnackbar(`Error — ${error.message}`, { variant: 'error' });
    }
  }

  // const handleSetChain = (event: any) => {
  //   setChainDistribution(event.target.value);
  // };

  // const handleSetTokenType = (event: any) => {
  //   setTokenType(event.target.value);
  // };

  const createCampaign = async () => {
    try {
      if (process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS === undefined) {
        throw new Error('NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS not set');
      }
      if (process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ABI === undefined) {
        throw new Error('NEXT_PUBLIC_CAMPAIGN_MANAGER_ABI not set');
      }

      console.log('creating campaign')

      setCreatingCampaign(true);

      const campaignManagerContract = new ethers.Contract(process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS, process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ABI, signer);

      // create campaign
      const tx = await campaignManagerContract.createCampaignNative(
        formName,
        formDescription,
        formTweetString,
        ethers.utils.parseEther(formTokensPerLike),
        ethers.utils.parseEther(formTokensPerRetweet),
        account?.twitterUserId,
        { value: ethers.utils.parseEther(formFunds) },
      );

      console.log(tx);

      await tx.wait();

      updateBalance();

      handleClose();
      setCreatingCampaign(false);
    } catch (error: any) {
      console.log(error);

      setFormErrorMessage(error.message);
      setShowFormError(true);
      setCreatingCampaign(false);
    }
  }

  const claimReward = async (event: any) => {
    try {
      if (account === null || account?.wallet === '') {
        throw new Error('account wallet undefined');
      }

      // get textfield with event id
      const campaignId = event.target.id.split('-')[1];
      const tweetId = (document.getElementById(`tweetid-${campaignId}`) as HTMLInputElement).value;

      setClaimingReward(true);
      setCurrentClaimRewardCampaignId(campaignId);

      // get user twitter handle
      const res = await fetch('/api/reward', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + account.idToken,
        },
        body: JSON.stringify({ signature: signature, twitterUserId: account.twitterUserId, tweetId: tweetId, campaignId: campaignId, wallet: account.wallet }),
      });

      console.log(res)

      const data = await res.json();

      if (res.status === 200) {
        console.log(`Successfully claimed reward at hash ${data.hash}`);

        enqueueSnackbar(`Successfully claimed reward — ${data.reward} MATIC`, { variant: 'success' });

        updateBalance();
      } else {
        throw new Error(data.error);
      }

      setClaimingReward(false);
      setCurrentClaimRewardCampaignId('');

    } catch (error: any) {
      setClaimingReward(false);
      setCurrentClaimRewardCampaignId('');

      console.log(error);

      if (error.message.includes('cannot estimate')) {
        enqueueSnackbar(`Error — Already claimed max rewards for this tweet`, { variant: 'error' });
        return;
      }

      if (error.message.includes('NoRewardToClaim')) {
        enqueueSnackbar(`Error — No rewards available for this tweet`, { variant: 'error' });
        return;
      }

      enqueueSnackbar(`Error — ${error.message}`, { variant: 'error' });
    }
  }

  // map campaigns to grid items
  return (
    <>
        <div className={styles.description}>
          <Stack spacing={2} direction="column">
            <div>
              CAMPAIGNS
            </div>
            <Stack spacing={2} direction="row">
              {isLoggedIn ? (
                <Button variant="contained" onClick={handleClickOpen}>
                  Create Campaign
                </Button>
              ) : (
                <p>
                  {loadingLogin ? 'Loading..' : 'Log in to create a campaign'}
                </p>
              )}
            </Stack>

            <Dialog open={formOpen} onClose={handleClose}>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogContent>
                <Stack spacing={2} direction="column">
                  <DialogContentText>
                    Create a twitter campaign that users can participate in. Fund it with rewards from your connected wallet.
                  </DialogContentText>
                  
                  <Stack spacing={2} direction="row">
                  <TextField
                    autoFocus
                    margin="dense"
                    id="form-ai-prompt"
                    label="OpenAI Prompt"
                    placeholder='(Optional) Describe your campaign theme..'
                    type="text"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <Button variant="outlined" onClick={handleClickOpenAI}>
                    {loadingOpenAI ? 
                    <CircularProgress/>
                    : 'Fill with OpenAI'}
                  </Button>
                  </Stack>

                  <TextField
                    autoFocus
                    margin="dense"
                    id="form-name"
                    label="Campaign Name"
                    placeholder='My Campaign'
                    type="text"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="standard"
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="form-description"
                    label="Campaign Description"
                    placeholder='Your campaign explained.'
                    type="text"
                    fullWidth
                    multiline
                    variant="standard"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="form-tweetstring"
                    label="Required Hashtag"
                    helperText="Users tweet this hashtag to claim rewards"
                    placeholder='#ThisCampaign'
                    type="text"
                    variant="standard"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormTweetString(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="form-funds"
                    label="Funds"
                    helperText={`Initial reward funds (Max ${account?.balance} MATIC)`}
                    placeholder='0.1'
                    type="float"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormFunds(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="form-tokensperlike"
                    label="Tokens per Like"
                    helperText="Tokens a participant can receive per like on their tweet"
                    placeholder='0.001'
                    type="float"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormTokensPerLike(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="form-tokensperretweet"
                    label="Tokens per Retweet"
                    helperText="Tokens a participant can receive per retweet on their tweet"
                    placeholder='0.002'
                    type="float"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setFormTokensPerRetweet(e.target.value)}
                  />
                  {
                  // <Stack spacing={2} direction="row">
                  //   <TextField
                  //     autoFocus
                  //     margin="dense"
                  //     id="form-funds"
                  //     label="Funds"
                  //     helperText="Initial reward funds"
                  //     placeholder='0.1'
                  //     type="float"
                  //     variant="outlined"
                  //   />
                  //   <Select
                  //     id="form-chain"
                  //     value={chainDistribution}
                  //     onChange={handleSetChain}
                  //   >
                  //     {chains.map((data) => (
                  //       <MenuItem key={data.value} value={data.value}>
                  //         {data.label}
                  //       </MenuItem>
                  //     ))}
                  //   </Select>
                  //   <Select
                  //     id="form-tokentype"
                  //     value={tokenType}
                  //     onChange={handleSetTokenType}
                  //   >
                  //     {tokenTypes.map((data) => (
                  //       <MenuItem key={data.value} value={data.value}>
                  //         {data.label}
                  //       </MenuItem>
                  //     ))}
                  //   </Select>
                  // </Stack>
                  }
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} disabled={creatingCampaign && !showFormError}>Cancel</Button>
                <Button onClick={createCampaign} disabled={creatingCampaign || showFormError}>
                  {creatingCampaign ? 
                  <CircularProgress/>
                  : 'Create'}
                </Button>
              </DialogActions>
              {showFormError ? (
                <Alert severity="error">
                  <AlertTitle>Error creating campaign!</AlertTitle>
                  Error — <strong>{formErrorMessage}</strong>
                </Alert>
              ) : ( creatingCampaign && (
                <Alert severity="info">
                  <AlertTitle>Creating campaign...</AlertTitle>
                  Please wait, this form will automatically close on success...
                </Alert>
              ))}
            </Dialog>

            <>
              <Stack spacing={0} direction="row">
                {campaigns.map((campaign: Campaign) => (
                  <Grid item key={campaign.campaignId} marginRight={2} marginBottom={2}>
                      <div className={styles.card}>
                        <Stack spacing={2} direction="column">
                          <Stack spacing={0} direction="column">
                            <h2>
                              {campaign.name}
                            </h2>
                            {campaign.ownerTwitterHandle && (
                              <h4>
                                by @{campaign.ownerTwitterHandle}
                              </h4>
                            )}
                          </Stack>
                          <div>{campaign.description}</div>
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
                          <code className={styles.code}> Total Rewards Left: {convertMaticUSD(campaign.rewardsLeft)} ({ethers.utils.formatEther(campaign.rewardsLeft)} MATIC)</code>
                          <Stack spacing={2} direction="column">
                            {isLoggedIn ? (
                              <>
                                <TextField
                                  inputProps={{ style: { color: "white" } }}
                                  margin="dense"
                                  id={`tweetid-${campaign.campaignId}`}
                                  label="Enter TweetId to Claim"
                                  placeholder='123456..'
                                  type="float"
                                  variant="outlined"
                                  onChange={(e) => setFormFunds(e.target.value)}
                                />
                                <Button disabled={claimingReward} variant="contained" color="secondary" id={`claimreward-${campaign.campaignId}`} onClick={claimReward}>
                                  {(claimingReward && currentClaimRewardCampaignId === campaign.campaignId) ? (
                                    <CircularProgress/>
                                  ) : (
                                    'Claim Reward'
                                  )}
                                </Button>
                              </>
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
            </>
            
          </Stack>
        </div>
    </>
  )
}
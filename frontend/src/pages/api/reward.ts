// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { BigNumber, ethers } from 'ethers';
import { verifyAuthMessage } from './auth';

const CAMPAIGN_MANAGER_ABI = `[{"inputs":[{"internalType":"address","name":"_backendAdmin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CampaignDoesNotExist","type":"error"},{"inputs":[{"internalType":"address","name":"participant","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FailedToSendRewards","type":"error"},{"inputs":[],"name":"NoRewardToClaim","type":"error"},{"inputs":[],"name":"NotEnoughRewardsLeft","type":"error"},{"inputs":[],"name":"OnlyBackendAdmin","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"string","name":"tweetString","type":"string"},{"indexed":false,"internalType":"uint256","name":"tokensPerLike","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokensPerRetweet","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardsLeft","type":"uint256"}],"name":"CampaignCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"wallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"tweetId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokensRewarded","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"likesRewarded","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"retweetsRewarded","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"inputs":[],"name":"backendAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"likes","type":"uint256"},{"internalType":"uint256","name":"retweets","type":"uint256"}],"internalType":"struct CampaignManager.TweetInfo","name":"_lastTweet","type":"tuple"},{"components":[{"internalType":"uint256","name":"likes","type":"uint256"},{"internalType":"uint256","name":"retweets","type":"uint256"}],"internalType":"struct CampaignManager.TweetInfo","name":"_currentTweet","type":"tuple"},{"components":[{"internalType":"uint256","name":"tokensPerLike","type":"uint256"},{"internalType":"uint256","name":"tokensPerRetweet","type":"uint256"}],"internalType":"struct CampaignManager.TweetRewardStats","name":"_tweetRewardStats","type":"tuple"}],"name":"calculateRewards","outputs":[{"internalType":"uint256","name":"tokensRewarded","type":"uint256"},{"internalType":"uint256","name":"likesRewarded","type":"uint256"},{"internalType":"uint256","name":"retweetsRewarded","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"campaignCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"campaigns","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"tweetString","type":"string"},{"components":[{"internalType":"uint256","name":"tokensPerLike","type":"uint256"},{"internalType":"uint256","name":"tokensPerRetweet","type":"uint256"}],"internalType":"struct CampaignManager.TweetRewardStats","name":"tweetRewardStats","type":"tuple"},{"internalType":"uint256","name":"rewardsLeft","type":"uint256"},{"internalType":"uint256","name":"totalRewardsGiven","type":"uint256"},{"components":[{"internalType":"enum CampaignManager.RewardType","name":"rewardType","type":"uint8"},{"internalType":"address","name":"tokenAddress","type":"address"}],"internalType":"struct CampaignManager.RewardToken","name":"rewardToken","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"participant","type":"address"},{"internalType":"uint256","name":"_campaignId","type":"uint256"},{"internalType":"uint256","name":"_tweetId","type":"uint256"},{"components":[{"internalType":"uint256","name":"likes","type":"uint256"},{"internalType":"uint256","name":"retweets","type":"uint256"}],"internalType":"struct CampaignManager.TweetInfo","name":"_currentTweetInfo","type":"tuple"}],"name":"claimRewardNativeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_tweetString","type":"string"},{"internalType":"uint256","name":"_tokensPerLike","type":"uint256"},{"internalType":"uint256","name":"_tokensPerRetweet","type":"uint256"}],"name":"createCampaignNative","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_campaignId","type":"uint256"}],"name":"getCampaignInfo","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`

type Data = {
  txnHash?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('HITTING REWARD API')

  // fetch a tweet using https://api.twitter.com/2/tweets/:id?tweet.fields=public_metrics
  // replace id with req.body.id
  // use node fetch

  const body = req.body;
  const signature = body.signature;
  const wallet = body.wallet;

  const validSignature = await verifyAuthMessage(wallet, signature);
  if (!validSignature) {
    res.status(401).json({ error: 'Invalid signature' })
    return;
  }

  const tweetId = body.tweetId;
  const campaignId = body.campaignId;

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`;
  const headers = []

  console.log('tweet reward url', url)

  try {
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${bearerToken}`}});
    
    /*
    returns smthn like:

    {
      "data": {
        "text": "Gm ☀️\n\nWe like onchain and dynamic works.\n\nBubble #108 by @glitch_life \n\n@wildxyz https://t.co/AdQHaKIHU6",
        "id": "1681960160275603461",
        "edit_history_tweet_ids": [
            "1681960160275603461"
        ],
        "public_metrics": {
          "retweet_count": 5,
          "reply_count": 19,
          "like_count": 55,
          "quote_count": 0,
          "bookmark_count": 0,
          "impression_count": 2312
        }
      }
    }
    */

    const json: any = await response.json();
    const tweet = json.data;
    console.log(tweet)
    const metrics = tweet.public_metrics;

    const likeCount = metrics.like_count;
    const retweetCount = metrics.retweet_count;

    if (!process.env.CAMPAIGN_MANAGER_ADDRESS) {
      throw new Error('CAMPAIGN_MANAGER_ADDRESS not set');
    }
    if (!process.env.DEV_PRIVATE_KEY) {
      throw new Error('DEV_PRIVATE_KEY not set');
    }

    // get RPC provider with NEXT_PUBLIC_QUICKNODE_MUMBAI env var
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI);

    // get signer with DEV_PRIVATE_KEY env var
    const signer = new ethers.Wallet(process.env.DEV_PRIVATE_KEY, provider);

    const campaignManagerContract = new ethers.Contract(process.env.CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI, signer);

    // get campaign info
    console.log(BigNumber.from(campaignId))
    console.log(parseInt(campaignId))
    const [_, __, tweetString, ___, ____, _____] = await campaignManagerContract.getCampaignInfo(parseInt(campaignId));

    // check data.text contains tweetString
    if (!tweet.text.includes(tweetString)) {
      res.status(400).json({ error: `Tweet does not contain the correct tweet string (${tweetString})` })
      return;
    }

    const tx = await campaignManagerContract.claimRewardNativeTo(wallet, campaignId, tweetId, [likeCount, retweetCount], { gasLimit: 1000000 });

    res.status(200).json({ txnHash: tx.hash })
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }

}
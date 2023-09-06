// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { BigNumber, ethers } from 'ethers';
import { verifyAuthMessage } from './auth';


type Data = {
  hash?: string
  reward?: string
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
  const twitterUserId = body.twitterUserId;

  const validSignature = await verifyAuthMessage(wallet, twitterUserId, signature);
  if (!validSignature) {
    res.status(401).json({ error: 'Invalid signature' })
    return;
  }

  const tweetId = body.tweetId;
  const campaignId = body.campaignId;

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics&expansions=author_id`;

  console.log('tweet reward url', url)

  try {
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${bearerToken}`}});
    
    /*
    returns:

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
    if (!process.env.CAMPAIGN_MANAGER_ABI) {
      throw new Error('CAMPAIGN_MANAGER_ABI not set');
    }
    if (!process.env.DEV_PRIVATE_KEY) {
      throw new Error('DEV_PRIVATE_KEY not set');
    }

    // get RPC provider with NEXT_PUBLIC_QUICKNODE_BASEGOERLI env var
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_QUICKNODE_BASEGOERLI);

    // get signer with DEV_PRIVATE_KEY env var
    const signer = new ethers.Wallet(process.env.DEV_PRIVATE_KEY, provider);

    const campaignManagerContract = new ethers.Contract(process.env.CAMPAIGN_MANAGER_ADDRESS, process.env.CAMPAIGN_MANAGER_ABI, signer);

    // get campaign info
    const campaignInfo = await campaignManagerContract.getCampaignInfo(parseInt(campaignId));

    if (tweet.author_id !== twitterUserId.toString()) {
      res.status(400).json({ error: 'Tweet author does not match user' })
      return;
    }

    // check data.text contains tweetString
    if (!tweet.text.includes(campaignInfo.tweetString)) {
      res.status(400).json({ error: `Tweet does not contain the correct tweet string (${campaignInfo.tweetString})` })
      return;
    }

    // last rewards via rewardsGiven
    const lastTweetInfoRewarded = await campaignManagerContract.lastTweetInfoRewarded(campaignId, tweetId);
    console.log('lastTweetInfoRewarded', lastTweetInfoRewarded)

    // read contract to calculate reward
    const possibleReward: any = await campaignManagerContract.calculateRewards([lastTweetInfoRewarded.likes, lastTweetInfoRewarded.retweets], [likeCount, retweetCount], [campaignInfo.tweetRewardStats.tokensPerLike, campaignInfo.tweetRewardStats.tokensPerRetweet]);
    console.log('possibleReward', possibleReward)

    console.log('\ncalling claimRewardNativeTo')
    console.log('tweetId', tweetId, parseInt(tweetId))
    console.log('campaignId', campaignId, parseInt(campaignId))
    console.log('wallet', wallet)
    const tx = await campaignManagerContract.claimRewardNativeTo(wallet, campaignId, tweetId, [likeCount, retweetCount]);

    const rewardFormatted = ethers.utils.formatEther(possibleReward.tokensRewarded.toString());

    res.status(200).json({ hash: tx.hash, reward: rewardFormatted })
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }

}
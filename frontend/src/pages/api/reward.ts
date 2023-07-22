// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { BigNumber, ethers } from 'ethers';
import { verifyAuthMessage } from './auth';


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
    if (!process.env.CAMPAIGN_MANAGER_ABI) {
      throw new Error('CAMPAIGN_MANAGER_ABI not set');
    }
    if (!process.env.DEV_PRIVATE_KEY) {
      throw new Error('DEV_PRIVATE_KEY not set');
    }

    // get RPC provider with NEXT_PUBLIC_QUICKNODE_MUMBAI env var
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI);

    // get signer with DEV_PRIVATE_KEY env var
    const signer = new ethers.Wallet(process.env.DEV_PRIVATE_KEY, provider);

    const campaignManagerContract = new ethers.Contract(process.env.CAMPAIGN_MANAGER_ADDRESS, process.env.CAMPAIGN_MANAGER_ABI, signer);

    // get campaign info
    const [_, __, tweetString, ___, ____, _____] = await campaignManagerContract.getCampaignInfo(parseInt(campaignId));

    // check data.text contains tweetString
    if (!tweet.text.includes(tweetString)) {
      res.status(400).json({ error: `Tweet does not contain the correct tweet string (${tweetString})` })
      return;
    }

    console.log('\ncalling claimRewardNativeTo')
    console.log('tweetId', tweetId, parseInt(tweetId))
    console.log('campaignId', campaignId, parseInt(campaignId))
    console.log('wallet', wallet)
    const tx = await campaignManagerContract.claimRewardNativeTo(wallet, campaignId, tweetId, [likeCount, retweetCount]);

    res.status(200).json({ txnHash: tx.hash })
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }

}
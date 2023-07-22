// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import 'dotenv/config'

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { ethers } from 'ethers';

const CAMPAIGN_MANAGER_ABI = `
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "participant",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_tweetId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "likes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "retweets",
            "type": "uint256"
          }
        ],
        "internalType": "struct CampaignManager.TweetInfo",
        "name": "_currentTweetInfo",
        "type": "tuple"
      }
    ],
    "name": "claimRewardNativeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`

type Data = {
  txnHash?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  // fetch a tweet using https://api.twitter.com/2/tweets/:id?tweet.fields=public_metrics
  // replace id with req.body.id
  // use node fetch

  const body = JSON.parse(req.body);
  const tweetId = body.tweetId;
  const campaignId = body.campaignId;

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`;
  const headers = [`Authorization: Bearer ${bearerToken}`]

  try {
    const response = await fetch(url, {headers: headers});
    
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
    const metrics = tweet.public_metrics;

    const likeCount = metrics.like_count;
    const retweetCount = metrics.retweet_count;

    if (!process.env.CAMPAIGN_MANAGER_ADDRESS) {
      throw new Error('CAMPAIGN_MANAGER_ADDRESS not set');
    }
    if (!process.env.DEV_PRIVATE_KEY) {
      throw new Error('DEV_PRIVATE_KEY not set');
    }

    // get RPC provider with QUICKNODE_MUMBAI env var
    const provider = new ethers.providers.JsonRpcProvider(process.env.QUICKNODE_MUMBAI);

    // get signer with DEV_PRIVATE_KEY env var
    const signer = new ethers.Wallet(process.env.DEV_PRIVATE_KEY, provider);

    const campaignManagerContract = new ethers.Contract(process.env.CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI, signer);

    // get campaign info
    const [_, __, tweetString, ___, ____, _____] = await campaignManagerContract.getCampaignInfo(campaignId);

    // check data.text contains tweetString
    if (!tweet.text.includes(tweetString)) {
      res.status(400).json({ error: `Tweet does not contain the correct tweet string (${tweetString})` })
      return;
    }

    const tx = await campaignManagerContract.claimRewardNativeTo(signer.address, campaignId, tweetId, [likeCount, retweetCount], { gasLimit: 1000000 });

    res.status(200).json({ txnHash: tx.hash })
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }

}
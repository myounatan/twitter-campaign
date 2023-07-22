// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import 'dotenv/config'

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

type Data = {
  twitterUserId?: string
  twitterHandle?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('HITTING TWITTER USER API')

  const body = JSON.parse(req.body);
  const tweetId = body.tweetId;

  const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAMyyowEAAAAAwV5OuezagNX8NDOKTFSqgxB5u2I%3DUHhXFjMjHeccl0uXx6ZOQvg2bbcRuVIxYB72TBT8DiDzJZLcYR';
  const url = `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id`;

  console.log(url)

  try {
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${bearerToken}`}});
    
    /*
    returns:

    {
      "data": {
        "id": "1682751937945513987",
        "text": "Test tweet #TestCampaign hehe",
        "author_id": "1371511387021791234", 
        "edit_history_tweet_ids": [
          "1682751937945513987"
        ]
      },
      "includes": {
        "users": [
          {
            "id": "1371511387021791234",
            "name": "CryptoWesties",
            "username": "cryptowesties"
          }
        ]
      }
    }
    */

    const json: any = await response.json();
    const tweetData = json.data;
    const tweetIncludes = json.includes;
    const authorId = tweetData.author_id;

    console.log('tweetData', tweetData)
    console.log('tweetIncludes', tweetIncludes)

    let twitterHandle = '';

    // find twitter handle in json.includes.users array
    for (let user of tweetIncludes.users) {
      console.log('user', user) 
      if (user.id === authorId) {
        console.log('twitter handle', user.username)

        twitterHandle = user.username;

        break;
      }
    }

    res.status(200).json({ twitterUserId: authorId, twitterHandle: twitterHandle })
  } catch (error: any) {
    console.log('ERRRRRRROR', error);
    res.status(500).json({ error: error.message });
  }

}
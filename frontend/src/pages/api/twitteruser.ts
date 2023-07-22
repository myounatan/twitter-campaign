// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import 'dotenv/config'

import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

type Data = {
  username?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('HITTING TWITTER USER API')

  const body = JSON.parse(req.body);
  const userId = body.userId;

  const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAMyyowEAAAAAwV5OuezagNX8NDOKTFSqgxB5u2I%3DUHhXFjMjHeccl0uXx6ZOQvg2bbcRuVIxYB72TBT8DiDzJZLcYR';
  const url = `https://api.twitter.com/2/users/${userId}`;

  console.log(url)

  try {
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${bearerToken}`}});
    
    /*
    returns smthn like:

    {
      "data": {
        "name": "CryptoWesties",
        "id": "1371511387021791234",
        "username": "cryptowesties"
      }
    }
    */

    const json: any = await response.json();
    const userData = json.data;

    console.log('userData', userData)

    res.status(200).json({ username: userData.username })
  } catch (error: any) {
    console.log('ERRRRRRROR', error);
    res.status(500).json({ error: error.message });
  }

}
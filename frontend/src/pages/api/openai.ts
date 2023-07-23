// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import 'dotenv/config'

import type { NextApiRequest, NextApiResponse } from 'next'

import { Configuration, OpenAIApi } from 'openai';


type Data = {
  campaignCopy?: any // { title: string, description: string, hashtag: string }
  error?: string
}

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('HITTING OPEN-AI API')

  const prompt = req.body.prompt;

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "user", content: prompt},
        {role: "system", content: `Given a theme, generate 3 bodies of text for a Twitter marketing campaign. The first body of text is a short catchy and unique title (less than 7 words). The second piece is a description of the campaign and why it is running (less than 200 characters). The third and last body of text is a viral twitter hashtag. Format these three pieces into a json with fields "title", "description" and "hashtag"`}
      ],
    });


    const text = chatCompletion.data.choices[0].message?.content;
    if (!text) {
      throw new Error('No text returned from OpenAI');
    }

    console.log(text);

    console.log(chatCompletion.data)

    let campaignCopy = JSON.parse(text);

    // check if campaignCopy is an array with multiple options inside
    if (Array.isArray(campaignCopy)) {
      // pick the first one
      campaignCopy = campaignCopy[0];
    }

    res.status(200).json({ campaignCopy: campaignCopy })

  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);

      res.status(500).json({ error: 'Failed to request OpenAI' })
    } else {
      console.log(error.message);

      res.status(500).json({ error: error.message })
    }
  }

}
export type Campaign = {
  campaignId: string

  owner: string
  name: string
  description: string

  tweetString: string

  tokensPerLike: number
  tokensPerRetweet: number

  rewardsLeft: number
}
export type Campaign = {
  campaignId: string

  owner: string
  ownerTwitterUserId: number
  ownerTwitterHandle?: string

  name: string
  description: string

  tweetString: string

  tokensPerLike: number
  tokensPerRetweet: number

  rewardsLeft: number
}
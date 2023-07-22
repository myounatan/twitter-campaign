export type RewardLog = {
  id: string // txh hash
  wallet: string
  twitterUserId: string
  twitterHandle?: string
  tweetId: number
  tokensRewarded: number
  campaign: {
    campaignId: string
  }
}
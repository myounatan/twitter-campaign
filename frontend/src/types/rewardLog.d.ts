export type RewardLog = {
  wallet: string
  tweetId: number
  tokensRewarded: number
  campaign: {
    campaignId: string
  }
}
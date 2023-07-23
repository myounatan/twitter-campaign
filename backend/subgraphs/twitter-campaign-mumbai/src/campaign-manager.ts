import {
  CampaignCreated as CampaignCreatedEvent,
  RewardClaimed as RewardClaimedEvent
} from "../generated/CampaignManager/CampaignManager"
import {
  Campaign,
  RewardLog,
  User,
  UserCampaign
} from "../generated/schema"

import { Bytes, BigInt, log } from '@graphprotocol/graph-ts'


export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let entity = new Campaign(
    Bytes.empty().concatI32(event.params.campaignId.toI32())
  )
  entity.campaignId = event.params.campaignId
  entity.owner = event.params.owner
  entity.name = event.params.name
  entity.description = event.params.description
  entity.tweetString = event.params.tweetString
  entity.tokensPerLike = event.params.tokensPerLike
  entity.tokensPerRetweet = event.params.tokensPerRetweet
  entity.rewardsLeft = event.params.rewardsLeft
  entity.ownerTwitterUserId = event.params.creatorTwitterUserId

  entity.participantCount = BigInt.fromI32(0)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  //log.warning('Processing RewardClaimedEvent: ', [event.transaction.hash.toHex()]);


  let entity = new RewardLog(
    event.transaction.hash
  )
  
  const campaignKey: Bytes = Bytes.empty().concatI32(event.params.campaignId.toI32())
  const userKey: Bytes = event.params.wallet
  const userCampaignKey: Bytes = userKey.concat(campaignKey)

  entity.campaign = campaignKey

  entity.wallet = event.params.wallet

  // check if User entity exists
  let user = User.load(userKey)
  if (!user) {
    user = new User(userKey)
    user.totalRewardsClaimed = BigInt.fromI32(0)
    user.wallet = event.params.wallet
  }

  user.totalRewardsClaimed = user.totalRewardsClaimed.plus(event.params.tokensRewarded)

  entity.tweetId = event.params.tweetId
  entity.tokensRewarded = event.params.tokensRewarded
  entity.likesRewarded = event.params.likesRewarded
  entity.retweetsRewarded = event.params.retweetsRewarded

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // update campaign rewards left
  let campaign = Campaign.load(campaignKey)
  if (campaign) {
    campaign.rewardsLeft = campaign.rewardsLeft.minus(event.params.tokensRewarded)
    campaign.participantCount = campaign.participantCount.plus(BigInt.fromI32(1))
    campaign.save()
  }

  // create UserCampaign entity
  // let userCampaign = UserCampaign.load(userCampaignKey)
  // if (!userCampaign) {
  //   userCampaign = new UserCampaign(userCampaignKey)
  //   userCampaign.user = userKey
  //   userCampaign.campaign = campaignKey
  // }

  user.save()
  entity.save()
}

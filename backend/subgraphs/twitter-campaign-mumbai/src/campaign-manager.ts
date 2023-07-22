import {
  CampaignCreated as CampaignCreatedEvent,
  RewardClaimed as RewardClaimedEvent
} from "../generated/CampaignManager/CampaignManager"
import {
  Campaign,
  RewardLog,
  User
} from "../generated/schema"

import { Bytes, BigInt } from '@graphprotocol/graph-ts'

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

  entity.participantCount = BigInt.fromI32(0)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let entity = new RewardLog(
    event.transaction.hash
  )
  
  entity.campaign = Bytes.empty().concatI32(event.params.campaignId.toI32())

  entity.wallet = event.params.wallet

  // check if User entity exists
  let user = User.load(event.params.wallet)
  if (!user) {
    user = new User(event.params.wallet)
    user.totalRewardsClaimed = BigInt.fromI32(0)
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
  let campaign = Campaign.load(Bytes.empty().concatI32(event.params.campaignId.toI32()))
  if (campaign) {
    campaign.rewardsLeft = campaign.rewardsLeft.minus(event.params.tokensRewarded)
    campaign.participantCount = campaign.participantCount.plus(BigInt.fromI32(1))
    campaign.save()
  }

  user.save()
  entity.save()
}

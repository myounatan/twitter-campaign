import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CampaignCreated,
  OwnershipTransferred,
  RewardClaimed
} from "../generated/CampaignManager/CampaignManager"

export function createCampaignCreatedEvent(
  campaignId: BigInt,
  owner: Address,
  name: string,
  description: string,
  tweetString: string,
  tokensPerLike: BigInt,
  tokensPerRetweet: BigInt,
  rewardsLeft: BigInt,
  creatorTwitterUserId: BigInt
): CampaignCreated {
  let campaignCreatedEvent = changetype<CampaignCreated>(newMockEvent())

  campaignCreatedEvent.parameters = new Array()

  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tweetString",
      ethereum.Value.fromString(tweetString)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokensPerLike",
      ethereum.Value.fromUnsignedBigInt(tokensPerLike)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokensPerRetweet",
      ethereum.Value.fromUnsignedBigInt(tokensPerRetweet)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardsLeft",
      ethereum.Value.fromUnsignedBigInt(rewardsLeft)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "creatorTwitterUserId",
      ethereum.Value.fromUnsignedBigInt(creatorTwitterUserId)
    )
  )

  return campaignCreatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRewardClaimedEvent(
  campaignId: BigInt,
  wallet: Address,
  tweetId: BigInt,
  tokensRewarded: BigInt,
  likesRewarded: BigInt,
  retweetsRewarded: BigInt
): RewardClaimed {
  let rewardClaimedEvent = changetype<RewardClaimed>(newMockEvent())

  rewardClaimedEvent.parameters = new Array()

  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "tweetId",
      ethereum.Value.fromUnsignedBigInt(tweetId)
    )
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "tokensRewarded",
      ethereum.Value.fromUnsignedBigInt(tokensRewarded)
    )
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "likesRewarded",
      ethereum.Value.fromUnsignedBigInt(likesRewarded)
    )
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "retweetsRewarded",
      ethereum.Value.fromUnsignedBigInt(retweetsRewarded)
    )
  )

  return rewardClaimedEvent
}

import 'dotenv/config';

// https://thegraph.com/docs/en/querying/querying-from-an-application/#apollo-client
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
  uri: process.env.GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
})

export async function queryApollo(query: string, variables?: any) {
  return await client.query({ query: gql(query), variables: variables })
}

// helper queries
export const GET_CAMPAIGNS = `
  campaigns($first: Int) {
    campaignId

    owner
    name
    description 
    tweetString

    tokensPerLike
    tokensPerRetweet

    rewardsLeft
  }
`

export const GET_CAMPAIGN = `
  campaign($campaignId: String!) {
    campaignId

    owner
    name
    description 
    tweetString

    tokensPerLike
    tokensPerRetweet

    rewardsLeft

    participantCount
  }
`

export const GET_CAMPAIGN_PARTICIPANTS = `
  campaign($campaignId: String!) {
    participantCount

    participants($first: Int) {
      user {
        wallet
      }
    }
  }
`

export const GET_CAMPAIGN_FULL = `
  campaign($campaignId: String!) {
    campaignId

    owner
    name
    description 
    tweetString

    tokensPerLike
    tokensPerRetweet

    rewardsLeft

    participantCount

    participants($first: Int) {
      user {
        wallet
      }
    }
  }
`

export const GET_CAMPAIGN_REWARDLOGS = `
  campaign(id: String!) {
    rewardLogs($first: Int) {
      wallet
      tweetId
      tokensRewarded
    }
  }
`

export const GET_ALL_REWARD_LOGS_IN_ORDER = `
  rewardLogs($first: Int, orderBy: blockTimestamp, orderDirection: desc) {
    id
    wallet
    tweetId
  }
`
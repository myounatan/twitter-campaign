import 'dotenv/config';

// https://thegraph.com/docs/en/querying/querying-from-an-application/#apollo-client
import { ApolloClient, DocumentNode, InMemoryCache, gql } from '@apollo/client'

console.log(process.env.GRAPHQL_ENDPOINT)
const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/12604/twitter-campaign-mumbai/version/latest',
  cache: new InMemoryCache(),
})

export async function queryApollo(query: DocumentNode, variables?: any) {
  return (await client.query({ query: query, variables: variables })).data
}

// helper queries
export const GET_CAMPAIGNS = gql(`
  query GetCampaigns($first: Int!) {
    campaigns(first: $first) {
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
  }
`)

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

export const GET_SORTED_REWARDLOGS = gql(`
  query GetSortedRewardLogs($first: Int!) {
    rewardLogs(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      id
      wallet
      tweetId
      tokensRewarded
      campaign {
        campaignId
      }
    }
  }
`)
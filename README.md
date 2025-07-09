# Twitter Campaign
## EthGlobal Paris 2023 Finalist

Twitter Campaigns is an on-chain A.I. enabled DAO-tool to create Twitter marketing campaigns that live on a smart-contract, taking DAO-tooling and social proof to a whole new level. The goal of this dapp is two-fold: To enable DAO's, or anybody to gain promotional social media posts through tokenized incentive, and to enable more non-crypto experts in participating in these incentives through FOMO and social-proof. As twitter is one of the most popular social networks in the world, we leverage the authentication and user accounts that already exist on Twitter and enable crypto functionality on top of it. The dapp UI is made up of 3 sections: 1. Account Summary, 2. Campaigns, and 3. Reward Logs.

1. Account Summary
   To create an account and use the dapp, users are onboarded via twitter and an account-abstracted (or AA) wallet powered by Safe AuthKit is given to the user. This serves as an authentication for the users twitter account and the wallet, in one flow! How convenient :D

   The wallet is displayed in the account summary. This is generated using the Safe AuthKit sdk, which uses Web3Auth, Auth0 and twitter authentication under the hood. The balance is displayed in USD and MATIC testnet. As a bonus, when logged in, we display the twitter icon for that account.

   Note: To fund the AA wallet, we use Biconomy's Transak SDK. This uses the same email connected to the twitter account making the on-ramp process that much easier. Although this doesn't really do anything on testnets, to accomplish simple testing we fund the AA wallet with Metamask manually. Although we manually fund for testing, pushing this app to production enabled anyone with a credit card to fund their AA wallet. According to Biconomy SDK docs, transak can also act as an off-ramp (although there are no docs or functionality present for this atm).

2. Campaigns
   Campaigns are defined in the CampaignManager as having a name, description, tweet string (more on this later), tweet reward stats and a number of token rewards. Anyone can create a campaign, the transaction fee is charged to the AA wallet. When creating a campaign, you are able to leverage the power of Open A.I. to write the copy for you! We set up a system in the backend to come up with the name, description and hashtag based on a given user prompt, all powered by A.I.

   Users participate in campaigns by submitting a tweet to a specific campaign for token rewards. Campaign rules dictate the tweet must contain a "tweet string" or in our general use case, a hashtag. Once a tweet is checked and allowed to qualify, each "like" and "retweet" is worth X and Y number of tokens respectively. The user can claim this reward without paying any gas. Transaction to claim rewards is run in the backend by an admin wallet. This is to ensure each tweet submitted is authenticated and authored by the same user submitting it. The likes and retweets are saved in the CampaignManager smart contract under a "tweetId" to avoid duplicate rewards.

   The idea of sponsoring the transaction for the user also comes from ease-of-use. Not everyone participating in campaigns will create them, so they shouldn't have to pay gas to claim their rewards. They have already done the work promoting the campaign by tweeting the specified hashtag!

   To display the Campaigns, we use TheGraph subgraph deployed on mumbai. On the campaign card, we feature the creator or "owner" of the campaign. This gives the feeling of "social-proof".

   Note: We did not focus on bot-checking or authenticating validity of the tweets likes and retweets. Theoretically we could use Twitters "impressions" metric or any other metric to create a more robust algorithm when rewarding participants.

3. Reward Logs
   These logs display all the rewards given out from campaigns. The logs feature the Twitter username of the recipient, and their reward amount (in MATIC and USD). This feature is to inspire others to participate by introducing some FOMO.

   To display the reward logs, we also use a TheGraph subgraph deployed on mumbai.

Notable mentions:

- All RPC urls and deployments were made through QuikNode mumbai RPC.
- All development was done under Polygon (mumbai).
- Safe AuthKit SDK, Biconomy Transak SDK, TheGraph subgrahs are used in development.

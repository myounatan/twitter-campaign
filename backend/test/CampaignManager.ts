import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from "chai";
import { ethers } from "hardhat";
import { CONVERT_WEI } from '../utils';

describe("CampaignManager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const [owner, account1] = await ethers.getSigners();

    const backendAdmin = owner.address;
  
    const constructorArgs = [backendAdmin];
    const campaignManager = await ethers.deployContract('CampaignManager', constructorArgs);
  
    await campaignManager.deployed();

    return { backendAdmin, campaignManager, owner, account1 };
  }

  it("should deploy campaign manager and execute functions properly", async function () {
    const { backendAdmin, campaignManager, owner, account1 } = await loadFixture(deployOneYearLockFixture);

    const campaignId = 1;
    const tweetId = 12345;
    const tweetInfo = [1, 1];

    const totalRewards = CONVERT_WEI(2);

    const campaignName = 'Test Campaign';
    const campaignDescription = 'Test Campaign Description';
    const tweetString = '#TestCampaign';
    const tokensPerLike = CONVERT_WEI(0.01);
    const tokensPerRetweet = CONVERT_WEI(0.02);

    // create campaign
    await campaignManager.createCampaignNative(campaignName, campaignDescription, tweetString, tokensPerLike, tokensPerRetweet, 0, { value: totalRewards });

    // get campaign
    {
      let campaignInfo = await campaignManager.getCampaignInfo(campaignId);

      // expect campaign to be correct
      expect(campaignInfo.name).to.equal(campaignName);
      expect(campaignInfo.description).to.equal(campaignDescription);
      expect(campaignInfo.tweetString).to.equal(tweetString);
      expect(campaignInfo.tweetRewardStats.tokensPerLike).to.equal(tokensPerLike);
      expect(campaignInfo.tweetRewardStats.tokensPerRetweet).to.equal(tokensPerRetweet);
      expect(campaignInfo.rewardsLeft).to.equal(totalRewards);
    }

    // pre calculate rewards
    const [tokensRewarded, likesRewarded, retweetsRewarded] = await campaignManager.calculateRewards([0, 0], tweetInfo, [tokensPerLike, tokensPerRetweet]);

    // claim rewards
    await expect(campaignManager.claimRewardNativeTo(account1.address, campaignId, tweetId, tweetInfo)).to.emit(campaignManager, 'RewardClaimed').withArgs(campaignId, account1.address, tweetId, tokensRewarded, likesRewarded, retweetsRewarded);
  
    {
      let campaignInfo = await campaignManager.getCampaignInfo(campaignId);
      
      // expect rewards to be deducted
      expect(campaignInfo.rewardsLeft).to.equal(totalRewards.sub(tokensRewarded));
    }
  });
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "hardhat/console.sol";

contract CampaignManager is Ownable, ReentrancyGuard {
    // enums

    enum RewardType {
        NATIVE,
        ERC20
    }

    // structs

    struct TweetInfo {
        uint256 likes;
        uint256 retweets;
    }

    struct TweetRewardStats {
        uint256 tokensPerLike; // wei
        uint256 tokensPerRetweet; // wei
    }

    struct RewardToken {
        RewardType rewardType;
        address tokenAddress;
    }

    struct Campaign {
        address owner;
        // general info
        string name;
        string description;
        // reward conditions
        string tweetString; // hashtag, or whatever
        TweetRewardStats tweetRewardStats;
        // reward trackers
        uint256 rewardsLeft;
        uint256 totalRewardsGiven;
        RewardToken rewardToken;
        mapping(address => uint256) rewardsGiven; // per wallet
        mapping(uint256 => TweetInfo) lastTweetInfoRewarded; // per tweet
    }

    // state variables

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    address public backendAdmin;

    // events

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string name,
        string description,
        string tweetString,
        uint256 tokensPerLike,
        uint256 tokensPerRetweet,
        uint256 rewardsLeft
    );

    event RewardClaimed(
        uint256 indexed campaignId,
        address indexed wallet,
        uint256 tweetId,
        uint256 tokensRewarded,
        uint256 likesRewarded,
        uint256 retweetsRewarded
    );

    // errors

    error ZeroAmount();
    error OnlyBackendAdmin();
    error CampaignDoesNotExist();
    error OnlyCampaignOwner();
    error NoRewardToClaim();
    error NotEnoughRewardsLeft();
    error FailedToSendRewards(address participant, uint256 amount);

    // modifiers

    modifier onlyBackendAdmin() {
        if (msg.sender != backendAdmin) revert OnlyBackendAdmin();
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        if (_campaignId >= campaignCount) revert CampaignDoesNotExist();
        _;
    }

    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }

    modifier onlyCampaignOwner(uint256 _campaignId) {
        if (msg.sender != campaigns[_campaignId].owner)
            revert OnlyCampaignOwner();
        _;
    }

    // constructor

    constructor(address _backendAdmin) {
        backendAdmin = _backendAdmin;
    }

    // public functions

    function getCampaignInfo(
        uint256 _campaignId
    )
        public
        view
        campaignExists(_campaignId)
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            campaigns[_campaignId].name,
            campaigns[_campaignId].description,
            campaigns[_campaignId].tweetString,
            campaigns[_campaignId].tweetRewardStats.tokensPerLike,
            campaigns[_campaignId].tweetRewardStats.tokensPerRetweet,
            campaigns[_campaignId].rewardsLeft
        );
    }

    // creates a campaign with reward token as the native
    function createCampaignNative(
        string memory _name,
        string memory _description,
        string memory _tweetString,
        uint256 _tokensPerLike,
        uint256 _tokensPerRetweet
    ) public payable nonReentrant nonZeroAmount(msg.value) returns (uint256) {
        uint256 rewardsLeft = msg.value;

        campaignCount++;

        campaigns[campaignCount].owner = msg.sender;
        campaigns[campaignCount].name = _name;
        campaigns[campaignCount].description = _description;

        campaigns[campaignCount].tweetString = _tweetString;

        campaigns[campaignCount]
            .tweetRewardStats
            .tokensPerLike = _tokensPerLike;

        campaigns[campaignCount]
            .tweetRewardStats
            .tokensPerRetweet = _tokensPerRetweet;

        campaigns[campaignCount].rewardsLeft = rewardsLeft;
        campaigns[campaignCount].rewardToken.rewardType = RewardType.NATIVE;

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _name,
            _description,
            _tweetString,
            _tokensPerLike,
            _tokensPerRetweet,
            rewardsLeft
        );

        return campaignCount;
    }

    function calculateRewards(
        TweetInfo memory _lastTweet,
        TweetInfo memory _currentTweet,
        TweetRewardStats memory _tweetRewardStats
    )
        public
        pure
        returns (
            uint256 tokensRewarded,
            uint256 likesRewarded,
            uint256 retweetsRewarded
        )
    {
        // check last tweet info is less than current tweet info in either likes or retweets
        uint256 lastLikes = _lastTweet.likes;
        uint256 lastRetweets = _lastTweet.retweets;

        uint256 currentLikes = _currentTweet.likes;
        uint256 currentRetweets = _currentTweet.retweets;

        if (lastLikes < currentLikes) {
            likesRewarded = currentLikes - lastLikes;
        }

        if (lastRetweets < currentRetweets) {
            retweetsRewarded = currentRetweets - lastRetweets;
        }

        if (likesRewarded == 0 && retweetsRewarded == 0)
            revert NoRewardToClaim();

        // calulated in wei
        tokensRewarded =
            likesRewarded *
            _tweetRewardStats.tokensPerLike +
            retweetsRewarded *
            _tweetRewardStats.tokensPerRetweet;
    }

    // public onlyCampaignOwner

    function withdrawCampaignFunds(
        uint256 _campaignId
    ) public onlyCampaignOwner(_campaignId) campaignExists(_campaignId) {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success)
            revert FailedToSendRewards(msg.sender, address(this).balance);
    }

    // public onlyOwner

    function withdraw() public onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        if (!success)
            revert FailedToSendRewards(owner(), address(this).balance);
    }

    // reward user for tweet
    // TODO: check if this handles like/retweet counter going down
    function claimRewardNativeTo(
        address participant,
        uint256 _campaignId,
        uint256 _tweetId,
        TweetInfo memory _currentTweetInfo
    ) public nonReentrant onlyBackendAdmin campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        // calculate rewards
        (
            uint256 tokensRewarded,
            uint256 likesRewarded,
            uint256 retweetsRewarded
        ) = calculateRewards(
                campaign.lastTweetInfoRewarded[_tweetId],
                _currentTweetInfo,
                campaign.tweetRewardStats
            );

        // check if there are enough tokens left to reward
        if (tokensRewarded > campaign.rewardsLeft)
            revert NotEnoughRewardsLeft();

        // update campaign state
        campaign.rewardsLeft -= tokensRewarded;
        campaign.totalRewardsGiven += tokensRewarded;

        // update tweet info
        campaign.lastTweetInfoRewarded[_tweetId] = _currentTweetInfo;

        // update user state
        campaign.rewardsGiven[participant] += tokensRewarded;

        // send tokens to user
        (bool success, ) = payable(participant).call{value: tokensRewarded}("");
        if (!success) revert FailedToSendRewards(participant, tokensRewarded);

        emit RewardClaimed(
            _campaignId,
            participant,
            _tweetId,
            tokensRewarded,
            likesRewarded,
            retweetsRewarded
        );
    }
}

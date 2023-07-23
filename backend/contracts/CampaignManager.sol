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

    struct CampaignOwnerInfo {
        address owner;
        uint256 twitterUserId;
    }

    struct Campaign {
        CampaignOwnerInfo ownerInfo;
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
    }

    mapping(uint256 => mapping(address => uint256)) public rewardsGiven;
    mapping(uint256 => mapping(uint256 => TweetInfo))
        public lastTweetInfoRewarded;

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
        uint256 rewardsLeft,
        uint256 creatorTwitterUserId
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
        if (_campaignId > campaignCount) revert CampaignDoesNotExist();
        _;
    }

    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }

    modifier onlyCampaignOwner(uint256 _campaignId) {
        if (msg.sender != campaigns[_campaignId].ownerInfo.owner)
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
    ) public view campaignExists(_campaignId) returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    // creates a campaign with reward token as the native
    function createCampaignNative(
        string memory _name,
        string memory _description,
        string memory _tweetString,
        uint256 _tokensPerLike,
        uint256 _tokensPerRetweet,
        uint256 _ownerTwitterUserId
    ) public payable nonReentrant nonZeroAmount(msg.value) returns (uint256) {
        campaignCount++;

        {
            Campaign storage campaign = campaigns[campaignCount];

            campaign.ownerInfo = CampaignOwnerInfo({
                owner: msg.sender,
                twitterUserId: _ownerTwitterUserId
            });

            campaign.name = _name;
            campaign.description = _description;

            campaign.tweetString = _tweetString;

            campaign.tweetRewardStats = TweetRewardStats({
                tokensPerLike: _tokensPerLike,
                tokensPerRetweet: _tokensPerRetweet
            });

            campaign.rewardsLeft = msg.value;
            campaign.rewardToken.rewardType = RewardType.NATIVE;
        }

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _name,
            _description,
            _tweetString,
            _tokensPerLike,
            _tokensPerRetweet,
            msg.value,
            _ownerTwitterUserId
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

        if (likesRewarded > 0)
            tokensRewarded = likesRewarded * _tweetRewardStats.tokensPerLike;

        if (retweetsRewarded > 0)
            tokensRewarded +=
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
                lastTweetInfoRewarded[_campaignId][_tweetId],
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
        lastTweetInfoRewarded[_campaignId][_tweetId].likes = _currentTweetInfo
            .likes;
        lastTweetInfoRewarded[_campaignId][_tweetId]
            .retweets = _currentTweetInfo.retweets;

        // update user state
        rewardsGiven[_campaignId][participant] += tokensRewarded;

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

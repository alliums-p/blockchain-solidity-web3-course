// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughETH();
error Lottery__TransferFailed();
error Lottery__NotOpen()

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {

    enum LotteryState {
        OPEN,
        CALCULATING
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;

    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;


    uint256 private s_lotteryFee;
    address payable[] private s_players;

    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimestamp;

    // Events
    event LotteryParticipation(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinatorV2, 
        uint256 lotteryFee, 
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        s_lotteryFee = lotteryFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;

        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;

        s_lotteryState = LotteryState.OPEN;

        s_lastTimestamp = block.timestamp;
        i_interval = interval;
    }

    function enterLottery() public payable {
        if(msg.value < s_lotteryFee) revert Lottery__NotEnoughETH();
        if(s_lotteryState != LotteryState.OPEN) revert Lottery__NotOpen();

        s_players.push(
            payable(msg.sender)
        );

        emit LotteryParticipation(msg.sender);
    }

    /**
        @dev This function that the Chainlink Keeper nodes call
        they look for the upkeepNeeded to return true

        The following should be tru in order to return true:
        1. Our time interval should have passed
        2. The lottery should have atleast 1 player, and have some ETH
        3. Subscription is funded with LINK
        4. The lottery should be in an "open" state.
    */
    function checkUpkeep(
        bytes calldata /*checkData*/
    ) 
    external override returns (
        bool upkeepNeeded, 
        bytes memory /** performData */
    ) {
        bool isOpen = (LotteryState.OPEN == s_lotteryState);

        bool timePassed = ((block.timestamp - s_lastTimestamp) > i_interval);
        bool hasPlayers = (s_pplayers.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    function requestRandomWinner() external {
        s_lotteryState = LotteryState.CALCULATING;

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/, 
        uint256[] memory randomWords
    ) 
        internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_lotteryState = LotteryState.OPEN;

        s_players = new address payable[](0);

        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if(!success) revert Lottery__TransferFailed();

        emit WinnerPicked(recentWinner);
    }

    function getLotteryFee() public view returns (uint256) {
        return s_lotteryFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// import "@chainlink"

error Lottery__NotEnoughETH();

contract Lottery {

    uint256 private s_lotteryFee;
    address payable[] private s_players;

    // Events
    event LotteryParticipation(address indexed player);

    constructor(uint256 lotteryFee) {
        s_lotteryFee = lotteryFee;
    }

    function enterLottery() {
        if(msg.value < s_lotteryFee) revert Lottery__NotEnoughETH();
        s_players.push(
            payable(msg.sender)
        );

        emit LotteryParticipation(msg.sender);
    }

    function requestRandomWinner() external {

    }

    function fulfillRandomWords() external {

    }

    function getLotteryFee() public view returns (uint256) {
        return s_lotteryFee;
    }

    function getPlater(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
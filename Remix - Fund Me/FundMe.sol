// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    uint256 public minUsd = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public owner;

    // Used in case any conditional statements are to be used by multiple functions 
    modifier onlyOwner() {
        require(owner == msg.sender, "Must be the owner!");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // `Payable` function makes it so that ETH can be sent through the function
    function fund() public payable {
        require(msg.value.getConversionRate() >= minUsd, "Must send greater USD!"); // `Require` condition for error handling
        
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {

        /** starting index, ending index, step amount */
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reseting the array
        funders = new address[](0);

        // `transfer` automatically reverts if the transfer fails
        // `send` only reverts transaction if a require statement is added
        // `call` a low level function with 2 data confirmation and returns (recommended to use for transfer!!!)
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(sent, "Transfer failed!");
    }

}
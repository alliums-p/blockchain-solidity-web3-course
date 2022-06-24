// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    uint256 public minUsd = 50 * 1e18;

    address[] public funders;

    mapping(address => uint256) public addressToAmountFunded;

    // `Payable` function makes it so that ETH can be sent through the function
    function fund() public payable {
        require(msg.value.getConversionRate() >= minUsd, "Must send greater USD!"); // `Require` condition for error handling
        
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable {
        require(address(this).balance > 0, "No balance");
        address payable to = payable(msg.sender);
        to.transfer(address(this).balance);
    }

}
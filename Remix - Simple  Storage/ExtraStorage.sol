//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./SimpleStorage.sol";

// Inheriting SimpleStorage contract
contract ExtraStorage is SimpleStorage  {

    // need to specify `override` if parent function is used in child contract
    function store(uint256 _favouriteNumber) public override {
        favouriteNumber = _favouriteNumber + 5;
    }

}
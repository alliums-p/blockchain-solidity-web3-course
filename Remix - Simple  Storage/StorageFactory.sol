// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./SimpleStorage.sol";

contract StorageFactory {

    // Array of SimpleStorage contract
    SimpleStorage[] public simpleStorageArray;

    // Instantiate/Deploy `new` SimpleStorage Contract
    function callSimpleStorageContract() public {
        SimpleStorage newStorage = new SimpleStorage();
        simpleStorageArray.push(newStorage);
    }

    // Store number to given Storage Contract by Index
    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber) public {
        SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        simpleStorage.store(_simpleStorageNumber);
    }

    // Fetch number from given Storage Contract by Index
    function sfGet(uint256 _simpleStorageIndex) public view returns(uint256) {
        return simpleStorageArray[_simpleStorageIndex].retrieve();
    }

}
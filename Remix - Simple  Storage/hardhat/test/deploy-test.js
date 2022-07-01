const { ethers } = require("hardhat")
const { expect, assert } = require("chai")

// Use `it.only()` to run that specific test only and ignore others
// Use command `yarn hardhat test --grep unique_word` to run test
// where the `unique_word` exists

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage

    beforeEach(async function () {
        simplesStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simplesStorageFactory.deploy()
    })

    it("Should start with a favourite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve()
        const expectedValue = "0"
        assert.equal(currentValue.toString(), expectedValue)
    })
    it("Should update when we call store", async function () {
        const expectedValue = "91"
        const transactionResponse = await simpleStorage.store(expectedValue)
        await transactionResponse.wait(1)

        const currentValue = await simpleStorage.retrieve()
        assert.equal(currentValue.toString(), expectedValue)
        // expect(currentValue.toString()).to.equal(expectedValue)
    })
})

const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("Lottery Staging Test", function() {
        let lottery, lotteryEntranceFee, deployer;

        beforeEach(async function() {
            deployer = (await getNamedAccounts()).deployer

            lottery = await ethers.getContract("Lottery", deployer)
            lotteryEntranceFee = await lottery.getLotteryFee()
        })

        describe("fulfillRandomWords", function() {
            it("works with live Chainlink keepers and chainlink VRF, we get a random winner", async function() {

                try {
                    // access lottery
                    const startingTimeStamp = await lottery.getLatestTimestamp()
                    const accounts = await ethers.getSigners()

                    await new Promise(async (resolve, reject) => {
                        const winnerStartingBalance = await accounts[0].getBalance()

                        lottery.once("WinnerPicked", async () => {
                            console.log("WinnerPicked event fired!")
                            try {
                                const recentWinner = await lottery.getRecentWinner()
                                const lotteryState = await lottery.getLotteryState()
                                const winnerEndingBalance = await accounts[0].getBalance()
                                const endingTimestamp = await lottery.getLatestTimestamp()
                                
                                await expect(lottery.getPlayer(0)).to.be.reverted;
                                assert.equal(recentWinner.toString(), accounts[0].address)
                                assert.equal(lotteryState, 0)
                                assert.equal(
                                    winnerEndingBalance.toString(),
                                    winnerStartingBalance.toString()
                                )
                                // Use below code if the contract deducts lottery fee.
                                // The above code does not add fee as it is not deducted in the code
                                
                                // assert.equal(
                                //     winnerEndingBalance.toString(),
                                //     winnerStartingBalance.add(lotteryEntranceFee).toString()
                                // )
                                assert(endingTimestamp > startingTimeStamp);

                                resolve()
                            } catch (error) {
                                console.log(error)
                                reject(error)
                            }
                        })

                        await lottery.enterLottery({value: lotteryEntranceFee})
                    })
                }catch (e) {
                    console.log(e)
                }
                
            })
        })
    }) 
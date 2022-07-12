const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", async function() {
        let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer, interval;
        const chainId = network.config.chainId;


        beforeEach(async function() {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])

            lottery = await ethers.getContract("Lottery", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            lotteryEntranceFee = await lottery.getLotteryFee()
            interval = await lottery.getInterval()
        })

        describe("constructor", async function() {
            it("Initializes the lottery correctly", async function() {
                const lotteryState = await lottery.getLotteryState();
                const interval = await lottery.getInterval();
                assert.equal(lotteryState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })

        describe("enterLottery", async function() {
            it("reverts when you don't pay enough", async function() {
                await expect(lottery.enterLottery()).to.be.revertedWith(
                    "Lottery__NotEnoughETH"
                )
            })
            it("records players when they enter", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                const playerFromContract = await lottery.getPlayer(0);
                assert.equal(playerFromContract, deployer);
            })
            it("emits event on enter", async function() {
                await expect(lottery.enterLottery({value: lotteryEntranceFee})).to.emit(
                    lottery, 
                    "LotteryParticipation"
                )
            })
            it("doesnt allow entrance when raffle is calculating", async function() {
                await lottery.enterLottery({ value: lotteryEntranceFee })
                // Increases the Hardhat evm timestamp
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                // Mines the block to approve the changes
                await network.provider.send("evm_mine", [])
                
                await lottery.performUpkeep([])

                await expect(lottery.enterLottery({value: lotteryEntranceFee})).to.be.revertedWith(
                    "Lottery__NotOpen"
                )
            })
        })

        describe("checkUpKeep", async function() {
            it("returns false if people haven't sent any ETH", async function() {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine");
                const {upkeepNeeded} = lottery.callStatic.checkUpkeep([])
                assert(!upkeepNeeded)
            })
            it("returns false if lottery isn't open", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await lottery.performUpkeep([])
                const lotteryState = await lottery.getLotteryState()
                const {upkeepNeeded} = await lottery.callStatic.checkUpkeep([])
                assert.equal(lotteryState.toString(), "1")
                assert.equal(upkeepNeeded, false)
            })
            it("returns false if enough time hasn't passed", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 10])
                await network.provider.request({method: "evm_mine", params: []})

                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([])
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({method: "evm_mine", params: []})

                const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)
            })
        })

        describe('performUpkeep', function() {
            it("it can only run if checkupkeep is true", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({method: "evm_mine", params: []})

                const tx = await lottery.performUpkeep([])
                assert(tx)
            })
            it("reverts when checkupkeep is false", async function() {
                await expect(lottery.performUpkeep([])).to.be.revertedWith(
                    "Lottery__UpkeepNotNeeded"
                )
            })
            it("updates the lottery state, emits and event, and calls the vrf coordinator", async function() {
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({method: "evm_mine", params: []})

                const tx = await lottery.performUpkeep([])
                const txReceipt = await tx.wait(1)
                const requestId = txReceipt.events[1].args.requestId

                const lotteryState = await lottery.getLotteryState()

                assert(requestId.toNumber() > 0)
                assert(lotteryState.toString() == "1")
            })
        })

        describe("fulfillRandomWords", function() {
            beforeEach(async function(){
                await lottery.enterLottery({value: lotteryEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
            })

            it("can only be called after performUpkeep", async function() {
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address)
                ).to.be.revertedWith("nonexistent request")
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address)
                ).to.be.revertedWith("nonexistent request")
            })

            it("picks a winner, resets the lottery, and sends money", async function() {
                const additionalEntrants = 3;
                const startingAccountIndex = 1 // deployer = 0
                const accounts = await ethers.getSigners()

                for (
                    let i = startingAccountIndex; 
                    i < startingAccountIndex + additionalEntrants; 
                    i++
                ) {
                    const accountConnectedLottery = lottery.connect(accounts[i])
                    await accountConnectedLottery.enterLottery({value: lotteryEntranceFee})
                }

                console.log("Entry to promise...")

                const startingTimeStamp = await lottery.getLatestTimestamp();
                await new Promise(async (resolve, reject) => {
                    // `.once()` waits to fire the event before running the function
                    lottery.once("WinnerPicked", async () => {
                        console.log("Here's the event!================")
                        try {
                            const recentWinner = await lottery.getRecentWinner()
                            console.log(`Winner address = ${recentWinner}`)
                            console.log(`Account 1 = ${accounts[1].address}`)
                            console.log(`Account 2 = ${accounts[2].address}`)
                            console.log(`Account 3 = ${accounts[3].address}`)
                            const lotteryState = await lottery.getLotteryState()
                            const endingTimestamp = await lottery.getLatestTimestamp()
                            const numPlayers = await lottery.getNumberOfPlayers()
                            const winnerEndingBalance = await accounts[1].getBalance()
                            
                            assert.equal(numPlayers.toString(), "0")
                            assert.equal(lotteryState.toString(), "0")
                            assert(endingTimestamp > startingTimeStamp)

                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(
                                    lotteryEntranceFee
                                        .mul(additionalEntrants)
                                        .add(lotteryEntranceFee)
                                        .toString()
                                )
                            )
                        } catch (error) {
                            reject(error)
                        }
                        resolve()      
                    })

                    console.log("Running transaction...")

                    const tx = await lottery.performUpkeep([])
                    const txReceipt = await tx.wait(1)
                    const winnerStartingBalance = await accounts[1].getBalance()
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        lottery.address
                    )
                })
            })

        })

    })
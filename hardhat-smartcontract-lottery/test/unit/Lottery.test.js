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

    })
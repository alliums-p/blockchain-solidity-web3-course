const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../")

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("FundMe", async function() {
        
        let fundMe, deployer, mockV3Aggregator;
        const fundValue = ethers.utils.parseEther("1");

        beforeEach(async function() {
            //deploy fundMe contract using hardhat-deploy

            // const accounts = await ethers.getSigners()
            // const accountZero = accounts[0];

            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        })

        describe("constructor", async function() {
            it("sets the aggregator address correctly", async function() {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address);
            })
        })

        describe("fund", async function() {
            it("Fails if you dont send enough ETH", async function() {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "FundMe__NotEnoughETH"
                );
            });
            it("updated the amount funded data structure", async function() {
                await fundMe.fund({value: fundValue});
                const funded = await fundMe.getAddressToAmountFunded(deployer);
                console.log(funded.toString())
                assert(funded.toString(), fundValue.toString());
            })
            it("Adds funder to array of funders",  async function() {
                await fundMe.fund({value: fundValue});
                const funder = await  fundMe.getFunder(0);
                assert.equal(funder, deployer)
            })
        })

        describe("withdraw", async function() {
            beforeEach(async function() {
                await fundMe.fund({value: fundValue});
            })
            it("withdraw ETH from a single founder", async function() {
                const startingFundMeBalance = await  fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingDeployerBalance = await  fundMe.provider.getBalance(
                    deployer
                )
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);


                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )

                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed * effectiveGasPrice;

                assert(endingFundMeBalance, 0);
                assert(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost)
                )
            })

            it("allows us to withdraw with multiple funders", async function() {
                const accounts = await ethers.getSigners();
                for(let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({value: fundValue});
                }

                const startingFundMeBalance = await  fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingDeployerBalance = await  fundMe.provider.getBalance(
                    deployer
                )

                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed * effectiveGasPrice;

                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )

                assert(endingFundMeBalance, 0);
                assert(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost)
                )

                await expect(fundMe.getFunder(0)).to.be.reverted

                for(i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(accounts[i].address),
                        0
                    )
                }
            })

            it("Only allows the owner to withdraw", async function() {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker);
                await expect(
                    attackerConnectedContract.withdraw()
                ).to.be.revertedWith("FundMe__NotOwner")
            })
        })
    });

// const { deployments, ethers, getNamedAccounts } = require("hardhat");
// const { assert } = require("chai");

// describe("FundMe", async function() {
//     let fundMe, deployer, mockV3Aggregator;

//     beforeEach(async function() {
//         //deploy fundMe contract using hardhat-deploy

//         // const accounts = await ethers.getSigners()
//         // const accountZero = accounts[0];

//         deployer = (await getNamedAccounts()).deployer;
//         await deployments.fixture(["all"]);
//         fundMe = await ethers.getContract("FundMe", deployer);
//         mockV3Aggregator = await ethers.getContract(
//             "MockV3Aggregator", 
//             deployer
//         );
//     })

//     describe("constructor", async function() {
//         it("sets the aggregator address correctly", async function() {
//             const response = await fundMe.getPriceFeed();
//             assert.equal(response, mockV3Aggregator.address);
//         })
//     })
// });
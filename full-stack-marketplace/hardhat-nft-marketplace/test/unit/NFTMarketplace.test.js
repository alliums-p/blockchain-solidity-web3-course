const { expect, assert } = require("chai")
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper.hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Unit testing of NFTMarketplace contract", async function () {
          // initializer and setups
          let marketplace, deployer, nft, accounts
          const tokenId = 0
          const listPrice = ethers.utils.parseEther("0.5")

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])

              marketplace = await ethers.getContract("NFTMarketplace", deployer)
              nft = await ethers.getContract("TestNft", deployer)
              await nft.mintNft()
              await nft.approve(marketplace.address, tokenId)
          })

          // Unit Test begins
          describe("listItem", function () {
              it("must be the owner of the nft", async function () {
                  marketplace = await marketplace.connect(accounts[1])
                  await expect(
                      marketplace.listItem(nft.address, tokenId, listPrice)
                  ).to.be.revertedWith("NFTMarketplace__NotNFTOwner()")
              })

              it("throws error if price is set <= 0", async function () {
                  await expect(
                      marketplace.listItem(nft.address, tokenId, "0")
                  ).to.be.revertedWith("NFTMarketplace__PriceMustBeAboveZero()")
              })

              it("must have nft approved for transfer", async function () {
                  await nft.approve(ethers.constants.AddressZero, tokenId)
                  await expect(
                      marketplace.listItem(nft.address, tokenId, listPrice)
                  ).to.be.revertedWith(
                      "NFTMarketplace__NotApprovedForMarketplace()"
                  )
              })

              it("must not be already listed", async function () {
                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  await expect(
                      marketplace.listItem(nft.address, tokenId, listPrice)
                  ).to.be.revertedWith("NFTMarketplace__AlreadyListed")
              })

              it("emits event on listing of NFT", async function () {
                  expect(
                      await marketplace.listItem(
                          nft.address,
                          tokenId,
                          listPrice
                      )
                  ).to.emit("ItemListed")
              })
          })

          describe("buyItem", function () {
              it("reverts on low price buy", async () => {
                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  marketplace = await marketplace.connect(accounts[1])

                  await expect(
                      marketplace.buyItem(nft.address, tokenId)
                  ).to.be.revertedWith("NFTMarketplace__PriceNotMet")
              })

              it("reverts if item is not listed", async () => {
                  await expect(
                      marketplace.buyItem(nft.address, tokenId)
                  ).to.be.revertedWith("NFTMarketplace__NFTNotListed")
              })

              it("transfers the nft to the buyer, updates the proceeds, and emits event", async () => {
                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  marketplace = await marketplace.connect(accounts[1])

                  expect(
                      await marketplace.buyItem(nft.address, tokenId, {
                          value: listPrice,
                      })
                  ).to.emit("ItemBought")

                  const newOwner = await nft.ownerOf(tokenId)
                  assert(newOwner.toString() == accounts[1].address)

                  const proceeds = await marketplace.getProceeds(
                      accounts[0].address
                  )
                  assert(proceeds.toString() == listPrice.toString())
              })
          })

          describe("cancelListing", function () {
              it("reverts if no listing is found", async function () {
                  const error = `NFTMarketplace__NFTNotListed("${nft.address}", ${tokenId})`
                  await expect(
                      marketplace.cancelListing(nft.address, tokenId)
                  ).to.be.revertedWith(error)
              })

              it("reverts if other than owner tries to cancel", async function () {
                  // const error = `NFTMarketplace__NotNFTOwner(${nft.address}, ${tokenId})`

                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  marketplace = await marketplace.connect(accounts[1])

                  await expect(
                      marketplace.cancelListing(nft.address, tokenId)
                  ).to.be.revertedWith("NFTMarketplace__NotNFTOwner()")
              })

              it("emits event and removes listing on cancel", async function () {
                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  expect(
                      await marketplace.cancelListing(nft.address, tokenId)
                  ).to.emit("ItemCanceled")

                  const exists = await marketplace.getListing(
                      nft.address,
                      tokenId
                  )
                  assert(exists.price.toString() == "0")
              })
          })

          describe("updateListing", function () {
              it("must be listed and be owner", async () => {
                  const error = `NFTMarketplace__NFTNotListed("${nft.address}", ${tokenId})`
                  await expect(
                      marketplace.updateListing(nft.address, tokenId, listPrice)
                  ).to.be.revertedWith(error)

                  await marketplace.listItem(nft.address, tokenId, listPrice)

                  marketplace = await marketplace.connect(accounts[1])
                  await expect(
                      marketplace.updateListing(nft.address, tokenId, listPrice)
                  ).to.be.revertedWith("NFTMarketplace__NotNFTOwner()")
              })

              it("emits event and updates price", async () => {
                  await marketplace.listItem(nft.address, tokenId, listPrice)

                  const newPrice = ethers.utils.parseEther("0.1")
                  expect(
                      await marketplace.updateListing(
                          nft.address,
                          tokenId,
                          newPrice
                      )
                  ).to.emit("ItemListed")

                  const listing = await marketplace.getListing(
                      nft.address,
                      tokenId
                  )
                  assert(listing.price.toString() == newPrice)
              })
          })

          describe("withdrawProceeds", function () {
              it("thorws error on 0 proceed withdrawls", async () => {
                  await expect(
                      marketplace.withdrawProceeds()
                  ).to.be.revertedWith("NFTMarketplace__NoProceeds()")
              })

              it("withdraws proceeds succesfully", async () => {
                  await marketplace.listItem(nft.address, tokenId, listPrice)
                  marketplace = marketplace.connect(accounts[1])

                  await marketplace.buyItem(nft.address, tokenId, {
                      value: listPrice,
                  })

                  marketplace = marketplace.connect(accounts[0])

                  const proceedBeforeWithdraw = await marketplace.getProceeds(
                      accounts[0].address
                  )
                  const balanceBefore = await deployer.getBalance()

                  const withdrawTx = await marketplace.withdrawProceeds()
                  const txReceipt = await withdrawTx.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const balanceAfter = await deployer.getBalance()

                  assert(
                      balanceAfter.add(gasCost).toString() ==
                          proceedBeforeWithdraw.add(balanceBefore).toString()
                  )
              })
          })
      })

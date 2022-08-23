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
              deployer = accounts.deployer
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
      })

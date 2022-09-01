const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 6

async function update() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const testNft = await ethers.getContract("TestNft")
    const price = ethers.utils.parseEther("2")

    const tx = await nftMarketplace.updateListing(
        testNft.address,
        TOKEN_ID,
        price
    )
    await tx.wait(1)

    console.log("Updated NFT!")
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

// yarn hardhat run scripts/update-item.js --network localhost

update()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

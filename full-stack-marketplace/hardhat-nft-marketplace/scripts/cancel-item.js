const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function cancel() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const testNft = await ethers.getContract("TestNft")
    const tx = await nftMarketplace.cancelListing(testNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT Canceled!")
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

// yarn hardhat run scripts/cancel-item.js --network localhost

cancel()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })

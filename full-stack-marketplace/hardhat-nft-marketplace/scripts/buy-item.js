const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 4

async function buy() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const testNft = await ethers.getContract("TestNft")
    const listing = await nftMarketplace.getListing(testNft.address, TOKEN_ID)
    const price = listing.price.toString()

    const tx = await nftMarketplace.buyItem(testNft.address, TOKEN_ID, {
        value: price,
    })
    await tx.wait(1)

    console.log("Bought NFT!")
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

// yarn hardhat run scripts/buy-item.js --network localhost

buy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

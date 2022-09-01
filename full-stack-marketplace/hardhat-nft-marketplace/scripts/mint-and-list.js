const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const testNft = await ethers.getContract("TestNft")
    console.log("minting...")
    const mintTx = await testNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving Nft...")

    const approveTx = await testNft.approve(nftMarketplace.address, tokenId)
    await approveTx.wait(1)
    console.log("Listing NFT...")

    const tx = await nftMarketplace.listItem(testNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("Listed!")

    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

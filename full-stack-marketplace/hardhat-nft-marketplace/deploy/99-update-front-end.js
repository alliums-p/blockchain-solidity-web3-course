const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractsFile =
    "../../full-stack-marketplace/nextjs-nft-marketplace-moralis/constants/networkMapping.json"
const frontEndAbiLocation =
    "../../full-stack-marketplace/nextjs-nft-marketplace-moralis/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        await updateContractAddress()
        await updateAbi()
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NFTMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    const testNft = await ethers.getContract("TestNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}TestNft.json`,
        testNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddress() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontEndContractsFile, "utf8")
    )

    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]["NFTMarketplace"].includes(
                nftMarketplace.address
            )
        ) {
            contractAddresses[chainId]["NFTMarketplace"].push(
                nftMarketplace.address
            )
        }
    } else {
        contractAddresses[chainId] = {
            NFTMarketplace: [nftMarketplace.address],
        }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
    console.log("Updated!!!!!!!!!")
}

module.exports.tags = ["all", "frontend"]

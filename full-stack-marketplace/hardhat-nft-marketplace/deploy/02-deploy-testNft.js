const { network } = require("hardhat")
const { developmentChains } = require("../helper.hardhat.config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("===============Deplopying TestNft=================")
    const args = []
    const nft = await deploy("TestNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name)) {
        log("Verifying testNFT contract...")
        verify(nft.address, args)
    }
    log("===============TestNft Deployed=================")
}

module.exports.tags = ["all", "testNft"]

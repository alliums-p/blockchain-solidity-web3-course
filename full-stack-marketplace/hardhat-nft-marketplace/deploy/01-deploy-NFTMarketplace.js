const { network } = require("hardhat")
const { developmentChains } = require("../helper.hardhat.config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("==================Deploying Marketplace=======================")

    const marketplace = await deploy("NFTMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name)) {
        // verify the contract here....
        log("Verifying contract...")
        verify(marketplace.address, [])
    }

    log("==================Marketplace Deployed=======================")
}

module.exports.tags = ["all", "marketplace"]

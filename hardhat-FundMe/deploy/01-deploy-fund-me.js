const { network } = require("hardhat");

const { networkConfig, developmentChains } = require("../helper.hardhat.config");
const { verify } = require("../utils/verify");

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await  getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;

    if(developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    // Use a mock for localhost/hardhat networks
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(
        !developmentChains.includes(network.name) && 
        process.env.ETHERSCAN_API
    ) {
        await verify(fundMe.address, args)
    }

    log("========================================")
}

// can be used to specify which files to run during deployment.
// e.g: `yarn hardhat deploy --tags fundme` - this runs deployment files which consists `fundme` keywork as tags
module.exports.tags = ["all", "fundme"] 
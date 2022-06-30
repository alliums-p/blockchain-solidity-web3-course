require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API = process.env.ETHERSCAN_API

module.exports = {
    solidity: "0.8.7",
    defaultNetwork: "hardhat",
    networks: {
        alchemy: {
            url: ALCHEMY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
        },
    },
    etherscan: {
        api: ETHERSCAN_API,
    },
}

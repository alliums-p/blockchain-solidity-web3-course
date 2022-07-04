require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")

require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

// This is a sample Hardhat task. To learn how to create your own go to
// require("./tasks/block-number")

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const RINKEBY_RPC_URL = process.env.ALCHEMY_RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API = process.env.ETHERSCAN_API || ""
const COINMARKETCAP_API = process.env.COINMARKETCAP_API || ""

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.6"
            }
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            timeout: 400000,
            blockConfirmations: 6
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            timeout: 400000,
        },
    },
    etherscan: {
        apiKey: {
            rinkeby: ETHERSCAN_API
        },
        customChains: [
            {
                network: "rinkeby",
                chainId: 4,
                urls: {
                    apiURL: "https://api-rinkeby.etherscan.io/api",
                    browserURL: "https://rinkeby.etherscan.io",
                }
            }
        ]
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API,
        // token: "MATIC", // specify different token for different blockchain
    },
    namedAccounts: {
      deployer: {
        default: 0,
        
      }
    }
}
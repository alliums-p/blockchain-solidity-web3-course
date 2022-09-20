const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
    },
    5: {
        name: "goerli",
    },
    31337: {
        name: "hardhat",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}

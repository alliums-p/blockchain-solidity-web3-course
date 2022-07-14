const { ethers } = require("hardhat")
const { abi } = require("./abi")

const contractAddress = "0xb29ea9ad260b6dc980513bba29051570b2115110"
const arbi_rpc = "https://arb1.arbitrum.io/rpc"

async function main() {
    let provider = new ethers.providers.JsonRpcProvider(arbi_rpc);
    let contract = new ethers.Contract(contractAddress, abi, provider); 
    // use abi & contract only if you want to execute mintNFT() function from code

    let hex_777 = ethers.utils.hexlify(777)
    let storage_data = await provider.getStorageAt(contractAddress, hex_777)
    console.log(storage_data) // answer for challege of basic hardhat NFT from patrick
}

main()
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectBtn = document.getElementById("connect-btn")
const fundBtn = document.getElementById("fund-btn")
const balanceBtn = document.getElementById("eth-balance")
const withdrawBtn = document.getElementById("withdraw")

connectBtn.onclick = connectWallet
fundBtn.onclick = fund
balanceBtn.onclick = getBalance
withdrawBtn.onclick = withdraw

async function connectWallet() {
    if (typeof window.ethereum != undefined) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectBtn.innerHTML = "Connected!"
        } catch (error) {
            console.error(error)
        }
    } else {
        console.error("No Metamask")
    }
}

async function fund() {
    const ethAmount = document.getElementById("fund-value").value;

    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(contractAddress, abi, signer)

        const sendValue = ethers.utils.parseEther(ethAmount)

        try {
            const transactionResponse = await contract.fund({
                value: sendValue,
            })
            await listenForTransactionMine(transactionResponse, provider)
            
        } catch (err) {
            console.log(err)
        }
    }
}

async function getBalance() {
    if(typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    if(typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (err) {
            console.error(err)
        }
    }
}

async function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining: ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, async (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations`
                )
                resolve()
            })
        } catch (error) {
            console.error(error)
            reject()
        }
    })
}
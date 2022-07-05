import { ethers } from "./ethers-5.6.esm.min.js"
import { contractAddress, abi } from "./constants.js"

const connectBtn = document.getElementById("connect-btn")
const fundBtn = document.getElementById("fund-btn")

connectBtn.onclick = connectWallet
fundBtn.onclick = fund

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
    const ethAmount = "0.1"

    if (typeof window.ethereum != undefined) {
        // let ethValue = ethers.utils.parseEther(ethAmount)
        // console.log(ethValue.toString())

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)

        const contract = new ethers.Contract(contractAddress, abi, signer)

        const sendValue = ethers.utils.parseEther(ethAmount)

        // console.log(address)
        // const accounts = await provider.getSigner(address)
        // contract.connect(accounts)
        // console.log(accounts)
        // console.log(accounts.getAddress())

        const transactionResponse = await contract.fund({
            value: sendValue,
        })
        transactionResponse.wait(1)
        console.log(transactionResponse)
        console.log(
            (
                await contract.getAddressToAmountFunded(signer.getAddress())
            ).toString()
        )
    }
}

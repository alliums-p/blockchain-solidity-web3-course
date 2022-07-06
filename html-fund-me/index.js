// import { ethers } from "./ethers-5.6.esm.min.js"
// import { abi, contractAddress } from "./constants.js"

// const connectBtn = document.getElementById("connect-btn")
// const fundBtn = document.getElementById("fund-btn")

// connectBtn.onclick = connectWallet
// fundBtn.onclick = fund

// async function connectWallet() {
//     if (typeof window.ethereum != undefined) {
//         try {
//             await window.ethereum.request({ method: "eth_requestAccounts" })
//             connectBtn.innerHTML = "Connected!"
//         } catch (error) {
//             console.error(error)
//         }
//     } else {
//         console.error("No Metamask")
//     }
// }

// async function fund() {
//     const ethAmount = "0.1"

//     if (typeof window.ethereum != undefined) {
//         // let ethValue = ethers.utils.parseEther(ethAmount)
//         // console.log(ethValue.toString())

//         const provider = new ethers.providers.Web3Provider(window.ethereum)
//         const signer = provider.getSigner()

//         const contract = new ethers.Contract(contractAddress, abi, signer)

//         const sendValue = ethers.utils.parseEther(ethAmount)

//         // console.log(address)
//         // const accounts = await provider.getSigner(address)
//         // contract.connect(accounts)
//         // console.log(accounts)
//         // console.log(accounts.getAddress())
//         console.log(contract)

//         try {
//             const transactionResponse = await contract.fund({
//                 value: sendValue,
//             })
//             transactionResponse.wait()
//             console.log(transactionResponse)
//             console.log(
//                 (
//                     await contract.getAddressToAmountFunded(signer.getAddress())
//                 ).toString()
//             )
//         } catch (err) {
//             console.log(err)
//         }
//     }
// }

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connect-btn");
const fundButton = document.getElementById("fund-btn");
// const balanceButton = document.getElementById("balanceButton");
// const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
// balanceButton.onclick = getBalance;
// withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected!";
  } else {
    fundButton.innerHTML = "Please install metamask!";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

async function fund() {
  const ethAmount = document.getElementById("fund-value").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirnations} confirmations`
      );
      resolve();
    });
  });
}
import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";
import { Form, useNotification } from "web3uikit";
import nftAbi from "../constants/TestNft.json";
import nftMarketplaceAbi from "../constants/NFTMarketplace.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";

export default function Home() {
    const { chainId } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainString].NFTMarketplace[0];

    const dispatch = useNotification();

    const { runContractFunction } = useWeb3Contract();

    async function approveAndList(data) {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult, "ether")
            .toString();

        const approveOption = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };

        await runContractFunction({
            params: approveOption,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (err) => {
                console.log(err);
            },
        });
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Time to list!");
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (err) => console.log(err),
        });
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing!",
            title: "NFT listed!",
            position: "topR",
        });
    }
    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
            ></Form>
        </div>
    );
}

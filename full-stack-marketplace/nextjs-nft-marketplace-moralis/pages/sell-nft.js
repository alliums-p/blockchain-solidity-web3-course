import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";
import { Form } from "web3uikit";
import nftAbi from "../constants/TestNft.json";

export default function Home() {
    async function approveAndList() {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult, "ether")
            .toString();

        const approveOption = {
            abi: nftAbi,
            conractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };
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

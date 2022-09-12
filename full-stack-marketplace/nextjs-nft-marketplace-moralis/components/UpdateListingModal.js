import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NFTMarketplace.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification();

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1);

        dispatch({
            type: "success",
            message: "Listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        });
    };

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => {
                        dispatch({
                            type: "error",
                            title:
                                error.message ||
                                "Listing Update - Error occurred during update",
                            position: "topR",
                        });
                    },
                    onSuccess: () => handleUpdateListingSuccess,
                });
            }}
        >
            <Input
                label="Update listing price in L1 Currency (ETH)"
                name="New listing price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value);
                }}
            />
        </Modal>
    );
}

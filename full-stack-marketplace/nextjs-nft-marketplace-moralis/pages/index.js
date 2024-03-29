import styles from "../styles/Home.module.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
    const { isWeb3Enabled } = useMoralis();
    const { data: listedNfts, isFetching: fetchingListedNfts } =
        useMoralisQuery("ActiveItem", (query) =>
            query.limit(10).descending("tokenId")
        );

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div>loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            const {
                                price,
                                nftAddress,
                                tokenId,
                                marketplaceAddress,
                                seller,
                            } = nft.attributes;

                            return (
                                <div>
                                    <NFTBox
                                        price={price}
                                        tokenId={tokenId}
                                        nftAddress={nftAddress}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`}
                                    />
                                </div>
                            );
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled!</div>
                )}
            </div>
        </div>
    );
}

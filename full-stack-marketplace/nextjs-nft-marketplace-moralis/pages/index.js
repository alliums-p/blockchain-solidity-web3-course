import styles from "../styles/Home.module.css";
import { useMoralisQuery } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
    const { data: listedNfts, isFetching: fetchingListedNfts } =
        useMoralisQuery("ActiveItem", (query) =>
            query.limit(10).descending("tokenId")
        );
    console.log("NFTS...........");
    console.log(listedNfts);

    return (
        <div className={styles.container}>
            {fetchingListedNfts ? (
                <div>loading...</div>
            ) : (
                listedNfts.map((nft) => {
                    console.log(nft.attributes);
                    const {
                        price,
                        nftAddress,
                        tokenId,
                        marketplaceAddress,
                        seller,
                    } = nft.attributes;

                    return (
                        <div>
                            Price: {price}, NftAddress: {nftAddress}, TokenId:{" "}
                            {tokenId}, MarketplaceAddress: {marketplaceAddress},
                            Seller: {seller}
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
            )}
        </div>
    );
}

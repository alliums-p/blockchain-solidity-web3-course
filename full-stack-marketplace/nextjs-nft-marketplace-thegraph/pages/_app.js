import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import Header from "../components/Header";
import Head from "next/head";
import "../styles/globals.css";

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const APOLLO_URI =
    "https://api.studio.thegraph.com/query/35170/nft-marketplace-fcc/v0.0.2";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: APOLLO_URI,
});

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    );
}

export default MyApp;

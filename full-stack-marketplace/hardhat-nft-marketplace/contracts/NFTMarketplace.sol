// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketplace();
error NFTMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);

contract NFTMarketplace {
    struct Listing {
        uint256 price;
        address seller;
    }

    // Events
    event ItemListed (address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);

    // ///////////////
    // Modifiers    //
    // ///////////////
    modifier notListed(address nftAddress, uint256 tokenId, address owner) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price > 0) {
            revert NFTMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    // NFT Contract address -> NFT TokenID -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // ////////////////
    // Main Functions
    // ////////////////

    function listItem(address nftAddress, uint256 tokenId, uint256 price) external {
        if(price <= 0) {
            revert NFTMarketplace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if(nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketplace__NotApprovedForMarketplace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);

        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }
}
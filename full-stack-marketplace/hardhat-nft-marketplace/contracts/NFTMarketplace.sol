// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketplace();
error NFTMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__NotNFTOwner();
error NFTMarketplace__NFTNotListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NFTMarketplace__NoProceeds();
error NFTMarketplace__TransferFailed();

contract NFTMarketplace is ReentrancyGuard{
    struct Listing {
        uint256 price;
        address seller;
    }

    // ///////////////
    // Events       //
    // ///////////////
    event ItemListed (address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed buyer, address indexed nftAddress, uint256 indexed tokenId, uint256  price);
    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId);

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
    
    modifier isNftOwner(address nftAddress, uint256 tokenId, address owner) {
        IERC721 nft = IERC721(nftAddress);
        if(nft.ownerOf(tokenId) != owner) {
            revert NFTMarketplace__NotNFTOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price <= 0) {
            revert NFTMarketplace__NFTNotListed(nftAddress, tokenId);
        }
        _;
    }

    // NFT Contract address -> NFT TokenID -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    // ////////////////
    // Main Functions
    // ////////////////

    /**
     * @notice  Method for listing your NFT on the marketplace
     * @param   nftAddress: address of the NFT
     * @param   tokenId:    The tokenId of the NFT
     * @param   price:      Listing price of the NFT
     * @dev     We could have the contract be the escrow for the NFTs
     *          but this way, people can still hold their NFTs when listed.
    */
    function listItem(
        address nftAddress, 
        uint256 tokenId, 
        uint256 price
    )   external 
        notListed(nftAddress, tokenId, msg.sender)
        isNftOwner(nftAddress, tokenId, msg.sender) 
    {
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

    /**
     * @notice  Method for buying listed NFT from the marketplace
     * @param   nftAddress: address of the NFT
     * @param   tokenId:    The tokenId of the NFT
     * @dev     Pull-over-push method is used for collecting NFT sold $ amount.
    */
    function buyItem(address nftAddress, uint256 tokenId) external payable
        nonReentrant 
        isListed(nftAddress, tokenId)
    {
        Listing memory nft = s_listings[nftAddress][tokenId];
        if(msg.value < nft.price) {
            revert NFTMarketplace__PriceNotMet(nftAddress, tokenId, nft.price);
        }

        // Pull-Over-Push choice. Thus, using proceeds here.
        s_proceeds[nft.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(nft.seller, msg.sender, tokenId);

        emit ItemBought(msg.sender, nftAddress, tokenId, nft.price);
    }

    /**
     * @notice  Method for cancel the listing in the marketplace
     * @param   nftAddress: address of the NFT
     * @param   tokenId:    The tokenId of the NFT
    */
    function cancelListing(address nftAddress, uint256 tokenId) 
        external isNftOwner(nftAddress, tokenId, msg.sender) 
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    /**
     * @notice  Method for updating the price of listed NFT from the marketplace
     * @param   nftAddress: address of the NFT
     * @param   tokenId:    The tokenId of the NFT
     * @param   newPrice:   The new price of the NFT
    */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )   external 
        isListed(nftAddress, tokenId) 
        isNftOwner(nftAddress, tokenId, msg.sender) 
    {
        s_listings[nftAddress][tokenId].price  = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId,  newPrice);
    }

    /**
     * @notice  Method for withdrawing proceeds for sold NFTs
    */
    function  withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NFTMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if(!success) {
            revert NFTMarketplace__TransferFailed();
        }
    }

    // ///////////////////
    // Getter Functions //
    // ///////////////////

    function getListing(address nftAddress, uint256 tokenId) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

}
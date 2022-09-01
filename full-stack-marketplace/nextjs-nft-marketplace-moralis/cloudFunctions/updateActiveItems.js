// Create a new table called "ActiveItems"
// Add items when they are listed on the marketplace
// Remove them when they are bought or canceled

Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();

    logger.info("Looking for confirmed tx...");
    if (confirmed) {
        logger.info("Found item!");
        const ActiveItem = Moralis.Object.extend("ActiveItem");

        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(
            `adding address: ${request.object.get(
                "address"
            )}, TokenId: ${request.object.get("tokenId")}`
        );
        logger.info("Saving...");
        await activeItem.save();
    }
});

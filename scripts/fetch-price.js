require("dotenv").config();
const { ethers } = require("ethers");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js");

// Step 1: Define Pyth Price Feed (e.g CRO/USD)
const price_feed_id = "0x23199c2bcb1303f667e733b9934db9eca5991e765b45f5ed18bc4b231415f2fe";

// Step 2: Define ABI (only necessary functions and events)
const abi = [
    "function getUpdateFee(bytes[] calldata updateData) public view returns (uint256)",
    "function fetchPrice(bytes[] calldata updateData, bytes32 priceFeed) public payable returns (int64)",
    "function getLatestPrice(bytes32 priceFeed) public view returns (int64)",
    "event PriceUpdated(bytes32 indexed priceFeed, int64 price)"
];

async function main() {

    // Step 3: Safety Check for required environmental variables
    if (!process.env.CRONOS_RPC || !process.env.PRIVATE_KEY) {
        console.error("Missing required environmental variables");
        process.exitCode = 1;
    }

    // Step 4: Connect to Cronos Network and Deployed Contract
    const contract_address = "0xDDe28D67ABd7d5D0920bD6995c2F186dD7C2153a";
    const provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contract_address, abi, wallet);
    const iface = new ethers.Interface(abi);

    console.log("Connected to contract: ", contract_address);

    // Step 5: Fetch Price Update data from Pyth via pyth-evm-js SDK.
    const pythConnection = new EvmPriceServiceConnection("https://hermes.pyth.network");
    const updateData = await pythConnection.getPriceFeedsUpdateData([price_feed_id]);
    const updateFee = await contract.getUpdateFee(updateData);
    console.log("Update fee:", updateFee.toString());

    // Step 6: Send transaction to fetch price on-chain
    const tx = await contract.fetchPrice(updateData, price_feed_id, {
        value: updateFee,
        gasLimit: 1_000_000,
    });

    const receipt = await tx.wait();
    console.log("Price fetched. Tx Hash:", receipt.hash);

    // Step 7: Parse emitted events to get updated price
    let priceFound = false;
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed.name === "PriceUpdated") {
                console.log(`PriceUpdated event: priceFeed=${parsed.args.priceFeed}, price=${parsed.args.price.toString()}`);
                priceFound = true;
                break;
            }
        } catch (err) {
            // Not a matching log, skip
        }
    }

    // Step 8: Fallback to calling latest price if no event found 
    if (!priceFound) {
        const latestPrice = await contract.getLatestPrice(price_feed_id);
        console.log("No PriceUpdated event found. Fallback to contract call:");
        console.log("Latest price from contract:", latestPrice.toString());
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

require("dotenv").config();
const { ethers } = require("ethers");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js");

// CRO/USD Feed ID
const price_feed_id = "0x23199c2bcb1303f667e733b9934db9eca5991e765b45f5ed18bc4b231415f2fe";

// ABI with event
const abi = [
    "function getUpdateFee(bytes[] calldata updateData) public view returns (uint256)",
    "function fetchPrice(bytes[] calldata updateData, bytes32 priceFeed) public payable returns (int64)",
    "function getLatestPrice(bytes32 priceFeed) public view returns (int64)",
    "event PriceUpdated(bytes32 indexed priceFeed, int64 price)"
];

async function main() {
    const contract_address = "0x3A7eCa1e7317bC8564D926AE6C0B6bfaB8018dc2";
    const provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contract_address, abi, wallet);
    const iface = new ethers.Interface(abi);

    const pythConnection = new EvmPriceServiceConnection("https://hermes.pyth.network");
    const updateData = await pythConnection.getPriceFeedsUpdateData([price_feed_id]);
    const updateFee = await contract.getUpdateFee(updateData);
    console.log("Update fee:", updateFee.toString());

    const tx = await contract.fetchPrice(updateData, price_feed_id, {
        value: updateFee,
        gasLimit: 1_000_000,
    });

    const receipt = await tx.wait();
    console.log("Price fetched. Tx Hash:", receipt.hash);

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

    if (!priceFound) {
        const latestPrice = await contract.getLatestPrice(price_feed_id);
        console.log("No PriceUpdated event found. Fallback to contract call:");
        console.log("Latest price from contract:", latestPrice.toString());
    }
}

main().catch(console.error);

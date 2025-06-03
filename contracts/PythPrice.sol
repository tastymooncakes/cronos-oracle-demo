// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";


/// @title PythPrice
/// @notice Contract demonstrates how to fetch and read prices from Pyth Network on Cronos.
contract PythPrice {
    IPyth pyth;

    /// @notice Emitted when the price is fetched and updated.
    event PriceUpdated(bytes32 indexed priceFeed, int64 price);

    /// @param _pyth The contract address of the deployed Pyth contract on Cronos.
    constructor(address _pyth) {
        pyth = IPyth(_pyth);
    }
    
    /// @notice Returns the required fee for submitting an update to Pyth.
    /// @param updateData Encode VAA update data returned by pyth-evm-js SDK.
    function getUpdateFee(bytes[] calldata updateData) public view returns (uint256) {
        return pyth.getUpdateFee(updateData);
    }    
    
    /// @notice Fetches and updates the price on-chain by submitting VAA.
    /// @dev Requires the caller to send enough TCRO or CRO to cover the update fee.abi
    /// @param updateData Encoded VAA update data returned by pyth-evm-js SDK.
    /// @param priceFeed Unique ID of asset's price feed (e.g. CRO/USD)
    /// @return The latest price after update
    function fetchPrice(
        bytes[] calldata updateData,
        bytes32 priceFeed
    ) public payable returns (int64) {
        
		// Get required fee.
        uint updateFee = pyth.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee sent");

        // Submit price update to Pyth contract
        pyth.updatePriceFeeds{value: updateFee}(updateData);

        // Fetch the latest price after update
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceFeed, 60);
        emit PriceUpdated(priceFeed, price.price);
        return price.price;
    }
    
    /// @notice Reads the latest available price from on-chain storage.
    /// @param priceFeed Unique ID of asset's price feed (e.g. CRO/USD)
    /// @return The last known price, updated within the past 60 seconds.
    function getLatestPrice(bytes32 priceFeed) public view returns (int64) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceFeed, 60);
        return price.price;
    }
}
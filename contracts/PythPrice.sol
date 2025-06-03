// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PythPrice {
    IPyth pyth;
    event PriceUpdated(bytes32 indexed priceFeed, int64 price);

    constructor(address _pyth) {
        pyth = IPyth(_pyth);
    }
    
    function getUpdateFee(bytes[] calldata updateData) public view returns (uint256) {
        return pyth.getUpdateFee(updateData);
    }    
    
    function fetchPrice(
        bytes[] calldata updateData,
        bytes32 priceFeed
    ) public payable returns (int64) {
		    // Fetch the priceUpdate from hermes.
        uint updateFee = pyth.getUpdateFee(updateData);
        require(msg.value >= updateFee, "Insufficient fee sent");

        pyth.updatePriceFeeds{value: updateFee}(updateData);

        // Fetch the latest price
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceFeed, 60);
        emit PriceUpdated(priceFeed, price.price);
        return price.price;
    }
    
    function getLatestPrice(bytes32 priceFeed) public view returns (int64) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceFeed, 60);
        return price.price;
    }
}
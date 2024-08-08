// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HealthDataMarketplace is Ownable {
    IERC20 public healthToken;

    struct Listing {
        address patient;
        uint256 recordIndex;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    event DataListed(uint256 indexed listingId, address indexed patient, uint256 recordIndex, uint256 price);
    event DataPurchased(uint256 indexed listingId, address indexed buyer, address indexed patient);

    constructor(address _healthTokenAddress) {
        healthToken = IERC20(_healthTokenAddress);
    }

    function listData(address _patient, uint256 _recordIndex, uint256 _price) external {
        listings[listingCount] = Listing(_patient, _recordIndex, _price, true);
        emit DataListed(listingCount, _patient, _recordIndex, _price);
        listingCount++;
    }

    function purchaseData(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing is not active");
        require(healthToken.balanceOf(msg.sender) >= listing.price, "Insufficient balance");

        listing.isActive = false;
        require(healthToken.transferFrom(msg.sender, listing.patient, listing.price), "Token transfer failed");

        emit DataPurchased(_listingId, msg.sender, listing.patient);
    }

    function getListingDetails(uint256 _listingId) external view returns (address, uint256, uint256, bool) {
        Listing storage listing = listings[_listingId];
        return (listing.patient, listing.recordIndex, listing.price, listing.isActive);
    }

    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](listingCount);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].isActive) {
                activeListings[activeCount] = i;
                activeCount++;
            }
        }

        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeListings[i];
        }

        return result;
    }
}
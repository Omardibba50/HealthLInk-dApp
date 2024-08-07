// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Health.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract HealthDataMarketplace is ReentrancyGuard {
    Health public healthContract;

    struct Researcher {
        address addr;
        string name;
    }

    struct DataListing {
        address patient;
        uint256 recordIndex;
        uint256 price;
        bool isActive;
    }

    mapping(address => Researcher) public researchers;
    mapping(uint256 => DataListing) public listings;
    uint256 public listingCount;

    event ResearcherRegistered(address indexed researcher);
    event DataListed(uint256 indexed listingId, address indexed patient, uint256 price);
    event DataPurchased(uint256 indexed listingId, address indexed buyer);

    constructor(address _healthContractAddress) {
        healthContract = Health(_healthContractAddress);
    }

    function registerResearcher(string memory _name) public {
        researchers[msg.sender] = Researcher(msg.sender, _name);
        emit ResearcherRegistered(msg.sender);
    }

    function listData(uint256 _recordIndex, uint256 _price) public {
        require(healthContract.getPatientRecordSize(msg.sender) > _recordIndex, "Invalid record index");
        require(healthContract.isRecordMonetized(msg.sender, _recordIndex), "Record is not monetized");

        listings[listingCount] = DataListing(msg.sender, _recordIndex, _price, true);
        emit DataListed(listingCount, msg.sender, _price);
        listingCount++;
    }

    function purchaseData(uint256 _listingId) public nonReentrant {
        DataListing storage listing = listings[_listingId];
        require(listing.isActive, "Listing is not active");
        require(healthContract.balanceOf(msg.sender) >= listing.price, "Insufficient balance");

        listing.isActive = false;
        healthContract.transferFrom(msg.sender, listing.patient, listing.price);

        emit DataPurchased(_listingId, msg.sender);
    }
} 
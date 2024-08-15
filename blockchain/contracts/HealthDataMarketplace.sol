// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IHealth {
    struct Record {
        string date;
        address creator;
        string diagnosis;
        string description;
        string[] files;
        bool isMonetized;
    }

    function hasRole(bytes32 role, address account) external view returns (bool);
    function viewRecords(address patient) external view returns (Record[] memory);
}

contract HealthDataMarketplace is Ownable, ReentrancyGuard {
    IERC20 public healthToken;
    IHealth public healthContract;

    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

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

    constructor(address _healthTokenAddress, address _healthContractAddress) {
        healthToken = IERC20(_healthTokenAddress);
        healthContract = IHealth(_healthContractAddress);
    }

    function listData(uint256 _recordIndex, uint256 _price) external {
        require(healthContract.hasRole(PATIENT_ROLE, msg.sender), "Only patients can list data");
        require(_price > 0, "Price must be greater than zero");

        IHealth.Record[] memory records = healthContract.viewRecords(msg.sender);
        require(_recordIndex < records.length, "Invalid record index");
        require(records[_recordIndex].isMonetized, "Record is not monetized");

        listings[listingCount] = Listing(msg.sender, _recordIndex, _price, true);
        emit DataListed(listingCount, msg.sender, _recordIndex, _price);
        listingCount++;
    }

    function purchaseData(uint256 _listingId) external nonReentrant {
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

    function updateHealthContract(address _newHealthContractAddress) external onlyOwner {
        healthContract = IHealth(_newHealthContractAddress);
    }

    function updateHealthToken(address _newHealthTokenAddress) external onlyOwner {
        healthToken = IERC20(_newHealthTokenAddress);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IHealthDataMarketplace {
    function listData(address patient, uint256 recordIndex, uint256 price) external;
}

contract Health is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant TOKENS_PER_RECORD = 10 * 10**18; // 10 tokens per record
    uint256 public constant FREE_TOKENS_ON_SIGNUP = 50 * 10**18; // 50 tokens for new users

    struct Patient {
        string aadhar;
        string name;
        string email;
        uint256 age;
        uint256 recordSize;
        bool hasClaimedTokens;
    }

    struct Doctor {
        string name;
        string hospital;
        string specialization;
        uint256 age;
        bool hasClaimedTokens;
    }

    struct Record {
        string date;
        address doctor;
        string diagnosis;
        string description;
        string[] files;
        bool isMonetized;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => Record[]) private patientRecords;

    IHealthDataMarketplace public marketplace;

    event TokensClaimed(address indexed user, uint256 amount);
    event RecordAdded(address indexed patient, address indexed doctor, uint256 recordIndex);
    event RecordMonetized(address indexed patient, uint256 recordIndex, uint256 price);

    constructor() ERC20("HealthLink Token", "HLT") {
        _mint(address(this), INITIAL_SUPPLY);
    }

    function setMarketplace(address _marketplaceAddress) external onlyOwner {
        marketplace = IHealthDataMarketplace(_marketplaceAddress);
    }

    function addPatient(string memory _aadhar, string memory _name, string memory _email, uint256 _age) public {
        require(bytes(patients[msg.sender].aadhar).length == 0, "Patient already registered");
        patients[msg.sender] = Patient(_aadhar, _name, _email, _age, 0, false);
    }

    function addDoctor(string memory _name, string memory _hospital, string memory _specialization, uint256 _age) public {
        require(bytes(doctors[msg.sender].name).length == 0, "Doctor already registered");
        doctors[msg.sender] = Doctor(_name, _hospital, _specialization, _age, false);
    }

    function claimFreeTokens() public {
        require(
            (bytes(patients[msg.sender].aadhar).length > 0 || bytes(doctors[msg.sender].name).length > 0),
            "User not registered"
        );
        
        if (bytes(patients[msg.sender].aadhar).length > 0) {
            require(!patients[msg.sender].hasClaimedTokens, "Tokens already claimed");
            patients[msg.sender].hasClaimedTokens = true;
        } else {
            require(!doctors[msg.sender].hasClaimedTokens, "Tokens already claimed");
            doctors[msg.sender].hasClaimedTokens = true;
        }

        _transfer(address(this), msg.sender, FREE_TOKENS_ON_SIGNUP);
        emit TokensClaimed(msg.sender, FREE_TOKENS_ON_SIGNUP);
    }

    function addRecord(address _patient, string memory _date, string memory _diagnosis, string memory _description, string[] memory _files) public {
        require(bytes(doctors[msg.sender].name).length > 0, "Only doctors can add records");
        Patient storage patient = patients[_patient];
        require(bytes(patient.aadhar).length > 0, "Patient not registered");
        
        Record memory newRecord = Record(_date, msg.sender, _diagnosis, _description, _files, false);
        patientRecords[_patient].push(newRecord);
        patient.recordSize++;
        
        _transfer(address(this), msg.sender, TOKENS_PER_RECORD);
        emit RecordAdded(_patient, msg.sender, patient.recordSize - 1);
    }

    function monetizeRecord(uint256 _recordIndex, uint256 _price) public {
        require(bytes(patients[msg.sender].aadhar).length > 0, "Only patients can monetize records");
        require(_recordIndex < patientRecords[msg.sender].length, "Invalid record index");
        require(!patientRecords[msg.sender][_recordIndex].isMonetized, "Record already monetized");

        patientRecords[msg.sender][_recordIndex].isMonetized = true;
        marketplace.listData(msg.sender, _recordIndex, _price);

        emit RecordMonetized(msg.sender, _recordIndex, _price);
    }

    function viewRecords(address _patient) public view returns (Record[] memory) {
        require(msg.sender == _patient || bytes(doctors[msg.sender].name).length > 0, "Only the patient or a doctor can view records");
        return patientRecords[_patient];
    }

    function getRecordCount(address _patient) public view returns (uint256) {
        return patientRecords[_patient].length;
    }

    function mintTokens(uint256 amount) public onlyOwner {
        _mint(address(this), amount);
    }

    function withdrawTokens(uint256 amount) public onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        _transfer(address(this), owner(), amount);
    }
}
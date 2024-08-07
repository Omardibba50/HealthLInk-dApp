// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Health is ERC20, Ownable {
    struct User {
        address addr;
        string password;
        uint categ;
        uint256 tokenBalance;
    }

    struct Record {
        string date;
        address doctor;
        string diagnosis;
        string description;
        string[] files;
        bool isMonetized;
    }

    struct Patient {
        string aadhar;
        string name;
        string email;
        uint age;
        address[] doctorAccessList;
        mapping(uint => Record) recordMap;
        uint recordSize;
        uint256 tokenBalance;
    }

    struct Doctor {
        address addr;
        string name;
        string hospital;
        string specialization;
        uint age;
        address[] patientAccessList;
        uint256 tokenBalance;
    }

    mapping(address => User) public users;
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;

    uint256 public constant TOKENS_PER_RECORD = 10 * 10**18; // 10 tokens
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens

    event RecordAdded(address indexed patient, address indexed doctor, uint256 recordIndex);
    event RecordMonetized(address indexed patient, uint256 recordIndex);

    constructor() ERC20("HealthLink Africa Token", "HLA") {
        _mint(address(this), INITIAL_SUPPLY);
    }

    function addPatient(string memory _aadhar, string memory _name, string memory _email, uint _age, string memory _password) public {
        users[msg.sender] = User(msg.sender, _password, 0, 0);
        patients[msg.sender].aadhar = _aadhar;
        patients[msg.sender].name = _name;
        patients[msg.sender].email = _email;
        patients[msg.sender].age = _age;
        patients[msg.sender].recordSize = 0;
        patients[msg.sender].tokenBalance = 0;
    }

    function addDoctor(string memory _name, string memory _hospital, string memory _specialization, uint _age, string memory _password) public {
        users[msg.sender] = User(msg.sender, _password, 1, 0);
        doctors[msg.sender] = Doctor(msg.sender, _name, _hospital, _specialization, _age, new address[](0), 0);
    }

    function addRecord(address _patient, string memory _date, string memory _diagnosis, string memory _description, string[] memory _files) public {
        require(users[msg.sender].categ == 1, "Only doctors can add records");
        Patient storage patient = patients[_patient];
        patient.recordMap[patient.recordSize] = Record(_date, msg.sender, _diagnosis, _description, _files, false);
        patient.recordSize++;

        _transfer(address(this), _patient, TOKENS_PER_RECORD);
        emit RecordAdded(_patient, msg.sender, patient.recordSize - 1);
    }

    function monetizeRecord(uint256 _recordIndex) public {
        require(_recordIndex < patients[msg.sender].recordSize, "Invalid record index");
        patients[msg.sender].recordMap[_recordIndex].isMonetized = true;
        emit RecordMonetized(msg.sender, _recordIndex);
    }

    function getTokenBalance(address _user) public view returns (uint256) {
        return users[_user].tokenBalance;
    }

    // New functions to expose patient data safely
    function getPatientRecordSize(address _patient) public view returns (uint256) {
        return patients[_patient].recordSize;
    }

    function isRecordMonetized(address _patient, uint256 _recordIndex) public view returns (bool) {
        require(_recordIndex < patients[_patient].recordSize, "Invalid record index");
        return patients[_patient].recordMap[_recordIndex].isMonetized;
    }

    // New function to get record details
    function getRecordDetails(address _patient, uint256 _recordIndex) public view returns (
        string memory date,
        address doctor,
        string memory diagnosis,
        string memory description,
        bool isMonetized
    ) {
        require(_recordIndex < patients[_patient].recordSize, "Invalid record index");
        Record storage record = patients[_patient].recordMap[_recordIndex];
        return (
            record.date,
            record.doctor,
            record.diagnosis,
            record.description,
            record.isMonetized
        );
    }

    // New function to get patient details
    function getPatientDetails(address _patient) public view returns (
        string memory aadhar,
        string memory name,
        string memory email,
        uint age,
        uint256 recordSize,
        uint256 tokenBalance
    ) {
        Patient storage patient = patients[_patient];
        return (
            patient.aadhar,
            patient.name,
            patient.email,
            patient.age,
            patient.recordSize,
            patient.tokenBalance
        );
    }
}

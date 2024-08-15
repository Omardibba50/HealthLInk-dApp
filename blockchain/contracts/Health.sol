// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Health is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant TOKENS_PER_RECORD = 10 * 10**18; // 10 tokens per record
    uint256 public constant FREE_TOKENS_ON_SIGNUP = 50 * 10**18; // 50 tokens for new users

    struct Patient {
        string name;
        string email;
        uint256 age;
        uint256 recordCount;
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
        address creator;
        string diagnosis;
        string description;
        string[] files;
        bool isMonetized;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => Record[]) private patientRecords;

    event PatientAdded(address indexed patient);
    event DoctorAdded(address indexed doctor);
    event RecordAdded(address indexed patient, address indexed creator, uint256 recordIndex);
    event RecordMonetized(address indexed patient, uint256 recordIndex, uint256 price);
    event TokensClaimed(address indexed user, uint256 amount);

    constructor() ERC20("HealthLink Token", "HLT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _mint(address(this), INITIAL_SUPPLY);
    }

    function addPatient(string memory _name, string memory _email, uint256 _age) public {
        require(!hasRole(PATIENT_ROLE, msg.sender), "Already registered as patient");
        patients[msg.sender] = Patient(_name, _email, _age, 0, false);
        _setupRole(PATIENT_ROLE, msg.sender);
        emit PatientAdded(msg.sender);
    }

    function addDoctor(string memory _name, string memory _hospital, string memory _specialization, uint256 _age) public {
        require(!hasRole(DOCTOR_ROLE, msg.sender), "Already registered as doctor");
        doctors[msg.sender] = Doctor(_name, _hospital, _specialization, _age, false);
        _setupRole(DOCTOR_ROLE, msg.sender);
        emit DoctorAdded(msg.sender);
    }

    function claimFreeTokens() public nonReentrant {
        require(hasRole(PATIENT_ROLE, msg.sender) || hasRole(DOCTOR_ROLE, msg.sender), "User not registered");
        
        if (hasRole(PATIENT_ROLE, msg.sender)) {
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
        require(hasRole(PATIENT_ROLE, _patient), "Invalid patient address");
        require(msg.sender == _patient || hasRole(DOCTOR_ROLE, msg.sender), "Unauthorized");
        
        Record memory newRecord = Record(_date, msg.sender, _diagnosis, _description, _files, false);
        patientRecords[_patient].push(newRecord);
        patients[_patient].recordCount++;
        
        if (hasRole(DOCTOR_ROLE, msg.sender)) {
            _transfer(address(this), msg.sender, TOKENS_PER_RECORD);
        }
        
        emit RecordAdded(_patient, msg.sender, patients[_patient].recordCount - 1);
    }

    function addPatientRecord(string memory _date, string memory _diagnosis, string memory _description, string[] memory _files) public {
        require(hasRole(PATIENT_ROLE, msg.sender), "Only patients can add their own records");
        
        Record memory newRecord = Record(_date, msg.sender, _diagnosis, _description, _files, false);
        patientRecords[msg.sender].push(newRecord);
        patients[msg.sender].recordCount++;
        
        emit RecordAdded(msg.sender, msg.sender, patients[msg.sender].recordCount - 1);
    }

    function getRecordCount(address _patient) public view returns (uint256) {
        return patientRecords[_patient].length;
    }

  function viewRecords(address _patient) public view returns (Record[] memory) {
        require(_patient != address(0), "Invalid patient address");
        require(msg.sender == _patient || hasRole(DOCTOR_ROLE, msg.sender), "Unauthorized: caller must be the patient or a doctor");
        require(hasRole(PATIENT_ROLE, _patient), "Address is not registered as a patient");
        
        Record[] memory records = patientRecords[_patient];
        
        // Instead of requiring records to exist, return an empty array if no records found
        if (records.length == 0) {
            return new Record[](0);
        }
        
        return records;
    }

    function monetizeRecord(uint256 _recordIndex, uint256 _price) public {
        require(hasRole(PATIENT_ROLE, msg.sender), "Only patients can monetize records");
        require(_recordIndex < patientRecords[msg.sender].length, "Invalid record index");
        require(!patientRecords[msg.sender][_recordIndex].isMonetized, "Record already monetized");

        patientRecords[msg.sender][_recordIndex].isMonetized = true;
        emit RecordMonetized(msg.sender, _recordIndex, _price);
    }

    function hasClaimedTokens(address _user) public view returns (bool) {
        if (hasRole(PATIENT_ROLE, _user)) {
            return patients[_user].hasClaimedTokens;
        } else if (hasRole(DOCTOR_ROLE, _user)) {
            return doctors[_user].hasClaimedTokens;
        }
        return false;
    }

    function mintTokens(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(address(this), amount);
    }

    function withdrawTokens(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        _transfer(address(this), msg.sender, amount);
    }
}
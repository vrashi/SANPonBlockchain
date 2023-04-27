//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.21 <0.7.0;

contract migrations {
    address public bureaucrat;
    
    struct Applicant
    {
        uint256 balance;
        uint256 magicNumber;
        bool provisionChangeRequested;
    }
    
    mapping(address => Applicant) public participants;
    mapping(address => bool) public users;
    mapping(address => bool) public merchants;
    
    event TicketTransferred(address indexed from, address indexed to, uint256 amount);
    event ProvisionChangeRequested(address indexed applicant, uint256 newBalance);
    event ProvisionChangeApproved(address indexed applicant, uint256 newBalance);
    event ProvisionChangeDenied(address indexed applicant, uint256 newBalance);
    event MagicNumberSet(address indexed merchant, uint256 magicNumber);
    event ApplicantRegister(address indexed user);
    event MerchantRegister(address indexed merchant);
    
    constructor() public
    {
        bureaucrat = msg.sender;
        users[msg.sender] = true;
    }
    
    modifier onlyBureaucrat()
    {
        require(msg.sender == bureaucrat, "Only the bureaucrat can perform this action");
        _;
    }
    
    modifier onlyApplicant()
    {
        require(!merchants[msg.sender], "You must have a not be a merchant to perform this action");
        _;
    }
    
    modifier onlyMerchant()
    {
        require(merchants[msg.sender], "Only merchants can perform this action");
        _;
    }
    
    function registerApplicant() public
    {
        require(!users[msg.sender], "You are already registered");
        
        users[msg.sender] = true;
        participants[msg.sender].balance = 0;
        participants[msg.sender].magicNumber = 0;
        participants[msg.sender].provisionChangeRequested = false;
        emit ApplicantRegister(msg.sender);
    }

    function registerMerchant() public
    {
        require(!merchants[msg.sender], "You are already registered");
        merchants[msg.sender] = true;
        emit MerchantRegister(msg.sender);
    }

    function transferTickets(address to, uint256 amount) public
    {
        require(participants[msg.sender].balance >= amount, "You do not have enough tickets to perform this transfer");
        participants[msg.sender].balance = participants[msg.sender].balance - amount;
        participants[to].balance = participants[to].balance + amount;
        emit TicketTransferred(msg.sender, to, amount);
    }
    
    function requestProvisionChange(uint256 amount) public onlyApplicant
    {
        participants[msg.sender].provisionChangeRequested = true;
        participants[msg.sender].magicNumber = 0;
        emit ProvisionChangeRequested(msg.sender, amount);
    }
    
    function approveProvisionChange(address applicant, uint256 amount) public onlyBureaucrat
    {
        require(participants[applicant].provisionChangeRequested, "No provision change has been requested for this applicant");
        participants[applicant].provisionChangeRequested = false;
        transferTickets(applicant, amount);
        emit ProvisionChangeApproved(applicant, amount);
    }
    
    function denyProvisionChange(address applicant) public onlyBureaucrat
    {
        require(participants[applicant].provisionChangeRequested, "No provision change has been requested for this applicant");
        participants[applicant].provisionChangeRequested = false;
        emit ProvisionChangeDenied(applicant, participants[applicant].balance);
    }
    
    function setMagicNumber(uint256 magicNumber) public onlyMerchant
    {
        require(magicNumber >= 0, "Magic number must be non-negative");
        participants[msg.sender].magicNumber = magicNumber;
        emit MagicNumberSet(msg.sender, magicNumber);
    }
}
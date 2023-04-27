//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.21 <0.7.0;

contract SNAP {
    address public bureaucrat;
    
    struct Applicant {
        uint256 balance;
        uint256 magicNumber;
        bool provisionChangeRequested;
    }
    
    mapping(address => Applicant) public applicants;
    mapping(address => bool) public merchants;
    
    event TicketProvisioned(address indexed applicant, uint256 amount);
    event TicketTransferred(address indexed from, address indexed to, uint256 amount);
    event ProvisionChangeRequested(address indexed applicant, uint256 newBalance);
    event ProvisionChangeApproved(address indexed applicant, uint256 newBalance);
    event ProvisionChangeDenied(address indexed applicant, uint256 newBalance);
    event MagicNumberSet(address indexed merchant, uint256 magicNumber);
    event TicketTraded(address indexed merchant, uint256 amount);
    
    constructor() public {
        bureaucrat = msg.sender;
    }
    
    modifier onlyBureaucrat() {
        require(msg.sender == bureaucrat, "Only the bureaucrat can perform this action");
        _;
    }
    
    modifier onlyApplicant() {
        require(applicants[msg.sender].balance > 0, "You must have a balance to perform this action");
        _;
    }
    
    modifier onlyMerchant() {
        require(merchants[msg.sender], "Only merchants can perform this action");
        _;
    }
    
    function provisionTickets(address applicant, uint256 amount) public onlyBureaucrat {
        applicants[applicant].balance += amount;
        emit TicketProvisioned(applicant, amount);
    }
    
    function transferTickets(address to, uint256 amount) public onlyApplicant {
        require(applicants[msg.sender].balance >= amount, "You do not have enough tickets to perform this transfer");
        applicants[msg.sender].balance -= amount;
        applicants[to].balance += amount;
        emit TicketTransferred(msg.sender, to, amount);
    }
    
    function requestProvisionChange(uint256 newBalance) public onlyApplicant {
        applicants[msg.sender].provisionChangeRequested = true;
        applicants[msg.sender].magicNumber = 0;
        emit ProvisionChangeRequested(msg.sender, newBalance);
    }
    
    function approveProvisionChange(address applicant, uint256 newBalance) public onlyBureaucrat {
        require(applicants[applicant].provisionChangeRequested, "No provision change has been requested for this applicant");
        applicants[applicant].balance = 0;
        applicants[applicant].balance += newBalance;
        applicants[applicant].provisionChangeRequested = false;
        emit ProvisionChangeApproved(applicant, newBalance);
    }
    
    function denyProvisionChange(address applicant) public onlyBureaucrat {
        require(applicants[applicant].provisionChangeRequested, "No provision change has been requested for this applicant");
        applicants[applicant].provisionChangeRequested = false;
        emit ProvisionChangeDenied(applicant, applicants[applicant].balance);
    }
    
    function setMagicNumber(uint256 magicNumber) public onlyMerchant {
        require(magicNumber >= 0, "Magic number must be non-negative");
        applicants[msg.sender].magicNumber = magicNumber;
        emit MagicNumberSet(msg.sender, magicNumber);
    }
    
    function tradeTickets(uint256 amount) public onlyMerchant {
        require(applicants[msg.sender].balance >= amount, "You do not have enough tickets to perform this trade");
        applicants[msg.sender].balance -= amount;
        payable(bureaucrat).transfer(amount);
        emit TicketTraded(msg.sender, amount);
    }

}
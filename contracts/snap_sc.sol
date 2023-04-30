//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SNAP is ERC721{
    address public bureaucrat;
    string[] public meal;
    mapping(string => bool) _mealExists;
    uint tokenCounter = 0;

    
    struct Applicant
    {
        uint256 balance;
        uint256 magicNumber;
        bool provisionChangeRequested;
        uint[] tokenId;
        string[] mealsOwned;
        mapping(string => uint[]) tokens;
        string openRequestMeal;
        bool registered;
    }
    struct merchant{
        uint[] tokenId;
        mapping(string => uint[]) tokens;
        bool registered;
    }
    
    mapping(address => Applicant) public participants;
    mapping(address => bool) public users;
    mapping(address => merchant) public merchants;
    
    event TicketTransferred(address indexed from, address indexed to, uint256 amount);
    event ProvisionChangeRequested(address indexed applicant, string mealRequested);
    event ProvisionChangeApproved(address indexed applicant, string mealTicket);
    event ProvisionChangeDenied(address indexed applicant, uint256 newBalance);
    event MagicNumberSet(address indexed merchant, uint256 magicNumber);
    event ApplicantRegister(address indexed user);
    event MerchantRegister(address indexed merchants);
    
    constructor() ERC721("Meal", "MEAL") 
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
        require(participants[msg.sender].registered, "You must be an applicant to perform this action");
        _;
    }
    
    modifier onlyMerchant()
    {
        require(merchants[msg.sender].registered, "Only merchants can perform this action");
        _;
    }
    
    function registerApplicant() public
    {
        require(!users[msg.sender], "You are already registered");
        
        users[msg.sender] = true;
        participants[msg.sender].balance = 0;
        participants[msg.sender].magicNumber = 0;
        participants[msg.sender].provisionChangeRequested = false;
        participants[msg.sender].registered = true;
        emit ApplicantRegister(msg.sender);
    }

    function registerMerchant() public
    {
        require(!merchants[msg.sender].registered, "You are already registered");
        merchants[msg.sender].registered = true;
        emit MerchantRegister(msg.sender);
    }


 
    function purchaseMeal(address to, string calldata mealToBuy) public onlyApplicant
    {
        require(participants[msg.sender].tokens[mealToBuy].length != 0, "You do not have enough tickets to perform this transfer");
        //participants[msg.sender].balance = participants[msg.sender].balance - amount;
        //participants[to].balance = participants[to].balance + amount;
        uint i = participants[msg.sender].tokens[mealToBuy].length;
        // uint mealsFound = 0;
        // for (i=0; i<=participants[msg.sender].tokenId.length; i++){
            // if (compare((participants[msg.sender].mealsOwned[i]),mealToBuy)){
        //         if(mealsFound < amount){
        //             // mealsFound = mealsFound + 1;
        //             // _transfer(msg.sender, to,participants[msg.sender].tokenId[i]);
        //             // delete participants[msg.sender].tokenId[i];
        //             // delete participants[msg.sender].mealsOwned[i];
        //         }
        //     }
        // }
        _transfer(msg.sender, to,participants[msg.sender].tokens[mealToBuy][i-1]);
        merchants[to].tokenId.push(participants[msg.sender].tokens[mealToBuy][i-1]);
        
        // merchants[msg.sender].tokens[participants[applicant].openRequestMeal].push(tokenCounter);
        participants[msg.sender].tokens[mealToBuy].pop();
        //  _transfer(msg.sender, to,participants[msg.sender].tokenId[0]);
    //    require(mealsFound == amount,"No Sufficient Meal Coupons Found");

        emit TicketTransferred(msg.sender, to,0);
    }
    function sendToGovt(address to, uint noOfTokens) public onlyMerchant
    {
        require(merchants[msg.sender].tokenId.length >= noOfTokens, "You do not have enough tickets to perform this transfer");
        
        // uint len = merchants[msg.sender].tokenId.length;
        
        for (uint256 i; i < noOfTokens;i++) {
            _transfer(msg.sender, to, merchants[msg.sender].tokenId[i]);
           
        }

        // _transfer(msg.sender, to,participants[msg.sender].tokens[mealToBuy][i-1]);
        // participants[msg.sender].tokens[mealToBuy].pop();

        emit TicketTransferred(msg.sender, to,0);
    }
    
    function requestProvisionChange(string calldata mealRequested) public onlyApplicant
    {
        require(!participants[msg.sender].provisionChangeRequested, "There is an open request already");
        participants[msg.sender].provisionChangeRequested = true;
        participants[msg.sender].openRequestMeal = mealRequested;
        emit ProvisionChangeRequested(msg.sender, mealRequested);
    }
    
    function approveProvisionChange(address applicant) public onlyBureaucrat
    {
        require(participants[applicant].provisionChangeRequested, "No provision change has been requested for this applicant");
        participants[applicant].provisionChangeRequested = false;
        mint(applicant);
        
        emit ProvisionChangeApproved(applicant, participants[applicant].openRequestMeal);
    }
    
    function mint(address applicant) public {
        //require(!_mealExists[_meal]);
        tokenCounter = tokenCounter + 1;
        meal.push(participants[applicant].openRequestMeal);
        _safeMint(applicant, tokenCounter);
        //_mealExists[participants[applicant].openRequestMeal] = true;
        participants[applicant].tokens[participants[applicant].openRequestMeal].push(tokenCounter);
        participants[applicant].mealsOwned.push(participants[applicant].openRequestMeal);
        participants[applicant].openRequestMeal = '';
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

    function getTokenId(address owner) public   view returns( uint  [] memory){
        return participants[owner].tokens["pizza"];
    }
    function getTokenIdMerchant(address owner) public   view returns( uint  [] memory){
        return merchants[owner].tokenId;
    }
    function getMealsOwned(address owner) public   view returns( string  [] memory){
        return participants[owner].mealsOwned;
    }
    function getTokenBalance() public   view returns( uint ){
        return balanceOf(msg.sender);
    }
}

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SNAP is ERC721 {
    address public owner;

    uint256 public ticketIndex;

    mapping(address => bool) public bureaucrats;
    mapping(address => bool) public applicants;
    mapping(address => bool) public merchants;

    mapping(uint256 => uint256) public magicNumbers;

    mapping(uint256 => address) public ticketOwner;
    mapping(address => uint256[]) public ownedTickets;



     struct TicketChangeRequest {
        uint256 newMagicNumber;
        address applicant;
    }

    mapping(uint256 => TicketChangeRequest) public ticketChangeRequests;



    event TicketCreated(address indexed bureaucrat, address indexed applicant, uint256 ticketId);
    event TicketProvisioned(address indexed bureaucrat, address indexed applicant, uint256 ticketId);
    event TicketDenied(address indexed bureaucrat, address indexed applicant, uint256 ticketId);
    event TicketChangeRequested(address indexed requester, uint256 indexed ticketId, uint256 newMagicNumber);
    event TicketTransferred(address indexed from, address indexed to, uint256 ticketId);
    event MagicNumberSet(address indexed merchant, uint256 ticketId, uint256 magicNumber);
    event TicketTraded(address indexed merchant, uint256 ticketId);
    event TicketChangeApproved(uint256 indexed ticketId);
    event TicketChangeDenied(uint256 indexed ticketId);

    constructor() ERC721("Repas", "RS") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyBureaucrat() {
        require(bureaucrats[msg.sender], "Not a bureaucrat");
        _;
    }

    modifier onlyApplicant() {
        require(applicants[msg.sender], "Not an applicant");
        _;
    }

    modifier onlyMerchant() {
        require(merchants[msg.sender], "Not a merchant");
        _;
    }

    function registerBureaucrat(address _address) external onlyOwner {
        bureaucrats[_address] = true;
    }

    function registerApplicant(address _address) external onlyOwner {
        applicants[_address] = true;
    }

    function registerMerchant(address _address) external onlyOwner {
        merchants[_address] = true;
    }

    function createTicket(address _applicant) external onlyBureaucrat {
        ticketIndex++;
        _safeMint(_applicant, ticketIndex);
        ticketOwner[ticketIndex] = _applicant;
        ownedTickets[_applicant].push(ticketIndex);
        emit TicketCreated(msg.sender, _applicant, ticketIndex);
    }
    function requestTickets(uint256 _numTickets) external onlyApplicant {
        require(_numTickets > 0, "Invalid number of tickets");
        for (uint i = 0; i < _numTickets; i++) {
            ticketIndex++;
            _safeMint(msg.sender, ticketIndex);
            ticketOwner[ticketIndex] = msg.sender;
            ownedTickets[msg.sender].push(ticketIndex);
            emit TicketCreated(msg.sender, msg.sender, ticketIndex);
        }
    }


    function respondToRequest(address _applicant, uint256 _numTickets, bool _provision) external onlyBureaucrat {
        require(applicants[_applicant], "Not an applicant");
        for (uint256 i = 0; i < _numTickets; i++) {
            if (_provision) {
                ticketIndex++;
                _safeMint(_applicant, ticketIndex);
                ticketOwner[ticketIndex] = _applicant;
                ownedTickets[_applicant].push(ticketIndex);
                emit TicketCreated(msg.sender, _applicant, ticketIndex);
                //emit TicketProvisioned(msg.sender, _applicant, ticketIndex);
            } else {
                emit TicketDenied(msg.sender, _applicant, 0);
            }
        }
    }

    
    function requestTicketChange(uint256 _ticketId, uint256 _newMagicNumber) external onlyApplicant {
        require(ticketOwner[_ticketId] == msg.sender, "Not the ticket owner");
        require(_newMagicNumber >= 0, "Invalid magic number");
        ticketChangeRequests[_ticketId] = TicketChangeRequest(_newMagicNumber, msg.sender);
        emit TicketChangeRequested(msg.sender, _ticketId, _newMagicNumber);
    }

    
  

    function respondToChangeRequest(uint256 _ticketId, bool _isApproved) external onlyBureaucrat {
        require(ticketOwner[_ticketId] != address(0), "Ticket does not exist");
        require(ticketChangeRequests[_ticketId].applicant != address(0), "No change request found");

        if (_isApproved) {
            magicNumbers[_ticketId] = ticketChangeRequests[_ticketId].newMagicNumber;
            emit TicketChangeApproved(_ticketId);
        } else {
            emit TicketChangeDenied(_ticketId);
        }

        delete ticketChangeRequests[_ticketId];
    }



    function transferToMerchant(address _merchant, uint256 _ticketId, uint256 _magicNumber) external {
        require(merchants[_merchant], "Not a registered merchant");
        require(ticketOwner[_ticketId] == msg.sender, "Not the ticket owner");
        magicNumbers[_ticketId] = _magicNumber;
        safeTransferFrom(msg.sender, _merchant, _ticketId);
        ticketOwner[_ticketId] = _merchant;
        emit TicketTransferred(msg.sender, _merchant, _ticketId);
    }
    function setMagicNumber(uint256 _ticketId, uint256 _magicNumber) external onlyMerchant {
        require(ticketOwner[_ticketId] == msg.sender, "Not the ticket owner");
        magicNumbers[_ticketId] = _magicNumber;
        emit MagicNumberSet(msg.sender, _ticketId, _magicNumber);
    }

    function tradeTicketForTax(uint256 _ticketId) external onlyMerchant {
        require(ticketOwner[_ticketId] == msg.sender, "Not the ticket owner");
        _transfer(msg.sender, address(this), _ticketId);
        emit TicketTraded(msg.sender, _ticketId);
    }

}
   

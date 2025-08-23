// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketNFT is ERC721Enumerable, Ownable {
    uint256 public maxTickets;      
    uint256 public ticketPrice;     
    uint256 public ticketsMinted;   
    string private baseTokenURI;    

    // mapping for storing contract address by address
    // mapping(address => address) private contractInteraction;
    // address(this)

    // Mapping for resale listings
    mapping(uint256 => uint256) public resalePrice; // tokenId -> price

    // Alternative existence tracking (override OpenZeppelin _exists)
    mapping(uint256 => bool) private _tokenExists;

    // events 
    event TicketBuyedSuccessfully(address buyer,uint tokenId,address contractAddress);


    // create event function 
   constructor(   
    string memory _eventName,
    string memory _symbol,
    uint256 _maxTickets,
    uint256 _ticketPrice,
    string memory _baseURI
) ERC721(_eventName, _symbol) Ownable(msg.sender) {
    maxTickets = _maxTickets;
    ticketPrice = _ticketPrice;
    baseTokenURI = _baseURI; // mongodb event url 
    // transferOwnership(msg.sender); // You can omit if Ownable sets owner automatically
}


    /// @notice Buy a new ticket directly from organizer
    function buyTicket(uint8 number) external payable {
        require(ticketsMinted < maxTickets, "All tickets sold");
        require(msg.value == ticketPrice, "Incorrect payment");
        uint256 tokenId;        
        for(uint8 i=0;i<number;i++){
        tokenId = ticketsMinted + 1;
        ticketsMinted++;
        _safeMint(msg.sender, tokenId);
        emit TicketBuyedSuccessfully(msg.sender,tokenId,address(this)); // stored in local storage (address/tokenId) that tells this owner owns the NFT. 
        }
        // contractInteraction[msg.sender] = address(this); 
      
        // Track existence for alternative _exists
        _tokenExists[tokenId] = true;
    }

    function remainingTickets() external view returns(uint256){
        return maxTickets - ticketsMinted;
    }

    // function getContractAddressByWalletAddress(address walletAddress) external  view returns(address) {
    //     require(contractInteraction[walletAddress] == address(this),"You didn't own this event ticket");
    //     return contractInteraction[walletAddress];
    // }

    /// @notice Organizer withdraws collected funds
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /// @notice List your ticket for resale
    function listForResale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(price > 0, "Price must be > 0");

        resalePrice[tokenId] = price;
    }

    /// @notice Buy a ticket from resale market
    function buyResaleTicket(uint256 tokenId) external payable {
        uint256 price = resalePrice[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "Ticket not for resale");
        require(msg.value == price, "Incorrect payment");
        require(seller != msg.sender, "Cannot buy your own ticket");

        // Clear resale listing
        resalePrice[tokenId] = 0;

        // Transfer ticket to buyer
        _transfer(seller, msg.sender, tokenId);

        // Pay the seller
        payable(seller).transfer(msg.value);
    }

    /// @notice Alternative _exists function
    function exists(uint256 tokenId) public view returns (bool) {
        return _tokenExists[tokenId];
    }

    /// @notice Helper: uint256 to string conversion
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + uint256(_i % 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        str = string(bstr);
    }

    /// @notice Returns metadata URI using alternatives
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Ticket does not exist");
        return string(abi.encodePacked(baseTokenURI, "/", uint2str(tokenId), ".json"));
    }

    function getTokensOfOwner(address nftContract, address owner) external view returns (uint256[] memory) {
        IERC721Enumerable token = IERC721Enumerable(nftContract);
        uint256 balance = token.balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = token.tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
}

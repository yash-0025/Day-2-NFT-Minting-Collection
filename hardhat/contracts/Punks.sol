// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@opnzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Punks is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string _baseTokenURI;
    
    uint256 public _price = 0.01 ether;

    bool public _paused;

    uint256 public maxtokenIds = 10;

    uint256 public tokenIds;


    modifier onlyWhenNotPaused() {
        require(!paused, "Contract currently Paused.");
        _;
    }

    constructor(string memory baseURI) ERC721("Punks", "YPPunks") {
        _baseTokenURI = baseURI;
    }


    function mint() public payable onlyWhenNotPaused {
        require(tokenIds < maxtokenIds,"Maximum supply of tokens already exceeded");
        require(msg.value >= _price,"Ether sent is not as much as required");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseUri() internal view virtual override returns(string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory) {
       require (
           _exists(tokenId),"ERC721Metada: URI query for nonexistent token"
       );

       string memory baseURI = _baseUri();
       return bytes(baseURI).length > 0
       ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
       : "";
       
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _onwer.call{value: amount}("");
        require(sent , "Failed to send Ether");
    }

    receive() external payable {}

    fallback() external payable {}

    
}
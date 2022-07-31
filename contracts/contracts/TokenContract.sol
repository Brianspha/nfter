pragma solidity >=0.6.2;
//"SPDX-License-Identifier: UNLICENSED"

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//@dev contract definition
contract TokenContract is ERC721, Ownable {
using Counters for Counters.Counter;
  Counters.Counter private tokenIds;


  constructor(string memory name, string memory symbol)
    public
    ERC721(name, symbol)
  {}

  function mintToken(address tokenOwner, string memory tokenURI)
    public 
    returns (uint256)
  {
    tokenIds.increment();
    _mint(tokenOwner, tokenIds.current());
    _setTokenURI(tokenIds.current(), tokenURI);
    return tokenIds.current();
  }


  function tokenExists (uint256 tokenId) public view returns(bool){
    return _exists(tokenId);
  }

   function totalSupply() public view override returns (uint256) {
        // _tokenOwners are indexed by tokenIds, so .length() returns the number of tokenIds
        return tokenIds.current();
    }
}
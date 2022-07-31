
pragma solidity >=0.6.2;
//"SPDX-License-Identifier: UNLICENSED"

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TokenContract.sol";
import "./ReentrancyGuard.sol";
//@dev contract definition 
//@dev has many logical errors
contract BidContract is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    /*============================================== modifier definitions============================================== */
    modifier onlyCancelledOrEnded(uint256 bidId) {
        require(nftBids[bidId].endTime <block.timestamp || nftBids[bidId].ended, "Bid not ended or cancelled");
        _;
    }
    modifier didPlaceBid(uint256 bidId){
        require(nftBids[bidId].currentBidders[msg.sender].active,"Did not place bid");
        _;
    }
    modifier onlyHighestBidder(uint256 bidId){
        require(msg.sender == nftBids[bidId].highestBidder, "Only highest bidder can call this function");
        _;
    }

    modifier onlyBidOwner(uint256 bidId){
        require(nftBids[bidId].owner == msg.sender, "Only bid owner can call this function");
        _;
    }
    /*============================================== struct  definitions============================================== */
    struct Token
    {    
        uint256 tokenId;
        address previousOwner;
        bool active;
    }
    struct Bid{
    address payable bidder;
    uint256 bidAmount;
    uint256 bidId; //@dev represents the bid id number
    bool active;
    bool withdrew;
    }
    struct TokenBid{
        address payable owner;
        uint256 bidId; //@dev used to indentify a bid 
        uint256 tokenId; //@dev the token being up for bidding
        uint256 startTime;
        uint256 endTime;
        address [] bidderKeys;
        uint256 startingPrice;
        uint256 currentMax;
        address payable highestBidder;
        mapping(address => Bid) currentBidders;
        bool active;
        bool ended;
        bool ownerWithdrew;
    }
    
    struct Bidder {
        address id;
        uint256 [] bids;
        bool active;
    }
    /*============================================== storage definitions============================================== */
    /*============================================== varibale definitions============================================== */
      Counters.Counter private bidIds;
      mapping(address => Bidder) bidders;
      mapping(uint256 => TokenBid) nftBids;
      mapping(uint256 => Token) escrowTokens;
      uint256 [] nftBidKeys; //@dev this represents all bids on the contract
      address [] bidderKeys;//@dev all bidder addresses
      TokenContract tokenContract;
      uint256 [] escrowTokenIds;

    /*============================================== events definitions============================================== */
    event BidCreated(uint256 indexed bidId, address indexed owner);
    event NewBidPlaced (uint256 indexed bidId, uint256 indexed bidAmount, bool indexed isHighestBidder);
    event UpdatedBidEndDate(uint256 indexed bidId, uint256 indexed newDate);
    event LogWithdrawal(address indexed receipient, uint256 indexed bidId, uint256 indexed amount);
    event CancelledBid(uint256 indexed bidId, uint256 indexed date);
    event BidEnded(uint256 indexed bidId, uint256 indexed date);
    event AddTokenToEscrow(uint256 indexed tokenId);
    event RemovedTokenFromEscrow(uint256 indexed tokenId);

    /*============================================== function definitions============================================== */

    constructor(address tokenAddress) public{
        require(tokenAddress != address(0), "Invalid token address");
        tokenContract=TokenContract(tokenAddress);
       
    }
    function storeTransferredToken(uint256 tokenId) public {
        require(msg.sender != address(0), "Invalid sender address");
        require(tokenId> 0, "Invalid token Id");
         escrowTokens[tokenId].active = true;
        escrowTokens[tokenId].tokenId=tokenId;
        escrowTokens[tokenId].previousOwner=msg.sender;
        escrowTokenIds.push(tokenId);
        emit AddTokenToEscrow(tokenId);
    }
    function widthDrawTokenFromEscrow(uint256 tokenId) public nonReentrant{ //@dev figure out how to restrict calling this function while a bid is active 
        require(tokenId> 0, "Invalid token Id");
        require(msg.sender != address(0), "Invalid sender address");
        require(escrowTokens[tokenId].active, "Token not found in escrow");
        require(tokenContract.ownerOf(tokenId) == address(this), "Token already withdrawn");
        escrowTokens[tokenId].tokenId=0;
        escrowTokens[tokenId].previousOwner=address(0);
        escrowTokens[tokenId].active = false;
        tokenContract.transferFrom(address(this),msg.sender,tokenId);
        emit RemovedTokenFromEscrow(tokenId);
    }

    function listToken(uint256 tokenId, uint256 startTime, uint256 endTime, uint256 tokenValue) public{
         require(msg.sender != address(0), "Invalid sender address");
         require(tokenContract.ownerOf(tokenId) == address(this), "Ownership not transferred to contract");
         require(startTime >0, "Startime must be greater than 0");
         require(startTime != endTime, "Starttime must not equal endTime");
         require( startTime < endTime, "StartTime must be greater than endTime");
         require(endTime>0 , "End Time must be greater than 0");
         require(startTime> block.timestamp, "startTime must be greater than current block timestamp");
        require(endTime> block.timestamp, "endTime must be greater than current block timestamp");
         require(tokenValue >0, "Bid price must be greater than 0");
         bidIds.increment();
        nftBids[bidIds.current()].bidId = bidIds.current();
        nftBids[bidIds.current()].tokenId = tokenId;
        nftBids[bidIds.current()].startTime=startTime;
        nftBids[bidIds.current()].endTime=endTime;
        nftBids[bidIds.current()].startingPrice=tokenValue;
        nftBids[bidIds.current()].active=true;
        nftBids[bidIds.current()].ended=false;
        nftBids[bidIds.current()].owner=msg.sender;
        nftBids[bidIds.current()].currentMax = tokenValue;
         nftBids[bidIds.current()].ownerWithdrew=false;
        nftBidKeys.push(bidIds.current());
        emit BidCreated(bidIds.current(), msg.sender);
    }

    function getBidderKeys() public view returns(address [] memory){
        return bidderKeys;
    }
    function getBidderDetails(address bidderId) public view returns(uint256 [] memory, bool){
        return (bidders[bidderId].bids,bidders[bidderId].active);
    }
    function getBidIds () public view returns (uint256 [] memory) {
        return nftBidKeys;
    }
    function getBid(uint256 bidId) public view returns (address,uint256,uint256,uint256,uint256,uint256,address)
    {
        return (nftBids[bidId].owner,nftBids[bidId].startTime,nftBids[bidId].endTime,nftBids[bidId].startingPrice,nftBids[bidId].currentMax,nftBids[bidId].tokenId, nftBids[bidId].highestBidder);
    }
    function bidActive(uint256 bidId) public view returns(bool){
      return  nftBids[bidId].active;
    }
    function bidExpired(uint256 bidId) public view returns(bool){
        return (nftBids[bidId].endTime <block.timestamp);

    }
    function placeBid(uint256 bidId) public payable {
        require(msg.sender != address(0), "Invalid sender address");
        require(!bidExpired(bidId), "Bid expired");
        require(msg.sender != nftBids[bidId].owner, "Owner cannot bid for token");
        require(msg.value >0 , "Cant place bid of 0");
        require(msg.value > nftBids[bidId].currentMax, "Cant place bid lower than current max bid"); 
        require(block.timestamp > nftBids[bidId].startTime, "Bid hasnt started");
        if(nftBids[bidId].currentBidders[msg.sender].active){
            nftBids[bidId].currentBidders[msg.sender].bidAmount=nftBids[bidId].currentBidders[msg.sender].bidAmount.add(msg.value);
        }
        else{
            nftBids[bidId].currentBidders[msg.sender].bidAmount=msg.value;
            nftBids[bidId].currentBidders[msg.sender].active=true;
            nftBids[bidId].currentBidders[msg.sender].bidId=bidId;
            nftBids[bidId].currentBidders[msg.sender].bidder =msg.sender;
            nftBids[bidId].bidderKeys.push(msg.sender);
            bidders[msg.sender].active = true;
            bidders[msg.sender].bids.push(bidId);
            bidders[msg.sender].id=msg.sender;
            bidderKeys.push(msg.sender);
        }
        bool highest = msg.value > nftBids[bidId].currentMax;
        if(highest){
            nftBids[bidId].currentMax = msg.value;
            nftBids[bidId].highestBidder=msg.sender;
        }
    endBid(bidId);
    emit NewBidPlaced(bidId,msg.value,highest);
    }
    function endBid (uint256 bidId) internal {
        if(!bidExpired(bidId)){
        nftBids[bidId].active = bidExpired(bidId);
        nftBids[bidId].ended = bidExpired(bidId);
        emit BidEnded(bidId, block.timestamp);
        }
    }
    function getCurrentMaxPriceForBid(uint256 bidId) public view returns(uint256){
       return nftBids[bidId].currentMax;
    }
    function cancelBid(uint256 bidId) public onlyBidOwner(bidId){
        nftBids[bidId].active =false;
        nftBids[bidId].owner = address(0);
        nftBids[bidId].active=false;
        nftBids[bidId].startTime=0;
        nftBids[bidId].endTime=0;
        nftBids[bidId].ended=true;
        tokenContract.transferFrom(address(this),nftBids[bidId].owner,nftBids[bidId].tokenId);
        emit CancelledBid(bidId, block.timestamp);
    }
    function extendBid (uint256 bidId,uint256 newDate) public onlyBidOwner(bidId){
        require(nftBids[bidId].owner  == msg.sender, "Only owner of bid allowed to call this function");
         require(!bidExpired(bidId), "Bid expired");
        require(nftBids[bidId].endTime > block.timestamp ,"new date must be greater than block.timestamp");
        require(nftBids[bidId].endTime > newDate, "new date mst be greater than old");
        nftBids[bidId].endTime = newDate;
        emit UpdatedBidEndDate(bidId,newDate);
    }
    function claimNFT(uint256 bidId) public didPlaceBid(bidId) onlyCancelledOrEnded(bidId) onlyHighestBidder(bidId) {
        require(msg.sender != address(0), "Invalid sender address");
        require(msg.sender != nftBids[bidId].owner, "Owner cannot claim token");
        require(tokenContract.tokenExists(nftBids[bidId].tokenId), "Token not longer exists");
        tokenContract.transferFrom(address(this),nftBids[bidId].highestBidder,nftBids[bidId].tokenId);
    }
    function withdraw(uint256 bidId) public onlyCancelledOrEnded(bidId) nonReentrant{
         endBid(bidId); //@dev this is to update the state of the bid if its due to end
         uint refundAmount=0;
      if(msg.sender == nftBids[bidId].owner && !nftBids[bidId].ownerWithdrew){
            refundAmount = nftBids[bidId].startingPrice;
            nftBids[bidId].ownerWithdrew=true;
            nftBids[bidId].startingPrice=0;
               }
       else {
          if (msg.sender  == nftBids[bidId].highestBidder){
            if(!nftBids[bidId].ownerWithdrew){
            refundAmount = nftBids[bidId].currentMax.sub(nftBids[bidId].startingPrice);
            }
            //@dev if the owner already withdrew the bid price the highest bidder cannot attemp to withdraw the transaction will fail 
            //@dev the highest bidder is only allowed to withdraw the difference between their highest bid and the starting bid price
         }
         else{ //@dev bid hasnt ended
           refundAmount = nftBids[bidId].currentBidders[msg.sender].bidAmount;
         }
        nftBids[bidId].currentBidders[msg.sender].bidAmount=nftBids[bidId].currentBidders[msg.sender].bidAmount.sub(refundAmount);
       }
        if (refundAmount == 0) revert();
        // send the funds
        if (!msg.sender.send(refundAmount)) revert();
        emit LogWithdrawal(msg.sender, bidId, refundAmount);
        
    }
}
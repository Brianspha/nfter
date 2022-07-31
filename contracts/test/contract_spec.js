/*global artifacts, contract, it*/

const bigNumber = require("bignumber.js");
const moment = require("moment");
/**/
const TokenContract = artifacts.require("TokenContract");
const BidContract = artifacts.require("BidContract");
const ERC721 = artifacts.require("ERC721");
var etherConverter = require("ether-converter");

let accounts, createdBids, bidPriceBefore, balanceBefore, balanceAfter;

// For documentation please see https://framework.embarklabs.io/docs/contracts_testing.html
config(
  {
    //deployment: {
    //  accounts: [
    //    // you can configure custom accounts with a custom balance
    //    // see https://framework.embarklabs.io/docs/contracts_testing.html#Configuring-accounts
    //  ]
    //},
    contracts: {
      deploy: {
        BidContract: {
          args: ["$TokenContract"],
        },
        TokenContract: {
          args: ["SampleNFT", "SNFT"],
        },
        ERC721: {
          args: ["SampleNFT", "SNFT"],
        },
      },
    },
  },
  (_err, web3_accounts) => {
    accounts = web3_accounts;
  }
);

contract("TokenContract", function() {
  it("Should mint a new token ", async () => {
    const receipt = await TokenContract.methods
      .mintToken(
        accounts[0],
        JSON.stringify({
          _id: "60b303a9710968ee196cd7f0",
          name: "Myra",
          description:
            "Exercitation incididunt consequat commodo ullamco ad occaecat cillum non fugiat do. Id ullamco nostrud id qui aute quis qui. Occaecat tempor do sit irure do. Aliquip enim pariatur laborum aliquip aliqua minim ea pariatur ipsum id tempor ut. Non in irure dolore quis nulla consequat anim ipsum velit eu. Ea commodo cillum laboris culpa culpa aliquip velit pariatur sint ad laboris officia sint qui. Sunt et qui nisi est ex nostrud tempor fugiat dolor enim. Tempor reprehenderit ea do adipisicing sunt laborum in. Ea aliquip veniam reprehenderit Lorem anim consectetur aliqua occaecat cillum irure est anim. Sint id consequat culpa pariatur aliqua sint incididunt.",
          value: "8.9937",
          picture: "https://picsum.photos/500/300?image=17",
        })
      )
      .send({ gas: 6000000, from: accounts[0] });
    assert.eventEmitted(receipt, "Transfer");
  });
  it("Should transfer ownership to the bidding contract", async () => {
    const receipt = await TokenContract.methods
      .transferFrom(accounts[0], BidContract.options.address, 1)
      .send({ gas: 6000000, from: accounts[0] });
    assert.eventEmitted(receipt, "Transfer");
  });
});
contract("BidContract", function() {
  it("Should put a token up for bidding", async () => {
    var startDate = new bigNumber(
      moment(new Date())
        .add(2, "m")
        .toDate()
        .getTime()
    ).toFixed();
    var endDate = new bigNumber(
      moment(new Date())
        .add(30, "m")
        .toDate()
        .getTime()
    ).toFixed(); //30 minutes from now
    startDate = Math.round(startDate / 1000);
    endDate = Math.round(endDate / 1000);
    console.log("startDate: ", startDate, " endDate: ", endDate);
    var tokenValue = etherConverter(0.0112313, "eth", "wei");
    console.log("tokenValue: ", tokenValue);
    const receipt = await BidContract.methods
      .listToken(1, startDate, endDate, tokenValue)
      .send({ gas: 6000000, from: accounts[0] });
    assert.eventEmitted(receipt, "BidCreated");
    await increaseTime(300);
  });

  it("Should get all bid ids", async () => {
    const bids = await BidContract.methods
      .getBidIds()
      .call({ gas: 6000000, from: accounts[0] });
    createdBids = bids;
    console.log("bids array: ", createdBids.length, " bidId: ", createdBids[0]);
    assert.strictEqual(createdBids.length > 0, true, "No bids found");
  });
  it("Should check if a bid exists", async () => {
    const found = await BidContract.methods
      .bidActive(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log("bidActive: ", found);
    assert.strictEqual(found, true, "Bid not active");
  });
  it("Should check if a bid has expired", async () => {
    const found = await BidContract.methods
      .bidExpired(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log("bidExpired: ", found);
    assert.strictEqual(found, false, "Bid not expired");
  });
  it("Should get a bid given an id", async () => {
    const bid = await BidContract.methods
      .getBid(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log("bid details: ", bid);
    bidPriceBefore = bid[4];
    assert.strictEqual(bid !== null, true, "Bid details not found");
  });
  it("Should place a new bid", async () => {
    var bidValue = etherConverter(0.3112313, "eth", "wei");
    console.log("placed newBid: ", bidValue);
    const receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[1],
      value: bidValue,
    });
    assert.eventEmitted(receipt, "NewBidPlaced");
  });

  it("Should get the current max bid price for a bid", async () => {
    const currentMax = await BidContract.methods
      .getCurrentMaxPriceForBid(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log(
      "current max: ",
      etherConverter(currentMax, "wei", "eth"),
      " old max: ",
      etherConverter(bidPriceBefore, "wei", "eth")
    );
    assert.strictEqual(
      etherConverter(bidPriceBefore, "wei", "eth") <
        etherConverter(currentMax, "wei", "eth"),
      true,
      "Current max hasnt changed"
    );
  });

  it("Should place multiple new bids", async () => {
    var oldBid = 0;
    var currentBid = etherConverter(0.3912313, "eth", "wei");
    console.log("currentBid[1]: ", currentBid);
    var receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[1],
      value: currentBid,
    });
    currentBid = etherConverter(0.4112313, "eth", "wei");
    console.log("currentBid[2]: ", currentBid);
    receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[2],
      value: currentBid,
    });
    currentBid = etherConverter(0.5112313, "eth", "wei");
    console.log("currentBid[3]: ", currentBid);
    receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[3],
      value: currentBid,
    });
    currentBid = etherConverter(0.6112313, "eth", "wei");
    console.log("currentBid[4]: ", currentBid);
    receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[4],
      value: currentBid,
    });
    currentBid = etherConverter(10.6112313, "eth", "wei");
    console.log("currentBid[5]: ", currentBid);
    receipt = await BidContract.methods.placeBid(createdBids[0]).send({
      gas: 6000000,
      from: accounts[5],
      value: currentBid,
    });
    assert.eventEmitted(receipt, "NewBidPlaced");
    await increaseTime(13800);
  });
  it("Should check if a bid has expired", async () => {
    const found = await BidContract.methods
      .bidExpired(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log("bidExpired: ", found);
    assert.strictEqual(found, true, "Bid not expired");
  });
  it("Should check if a bid is active", async () => {
    const found = await BidContract.methods
      .bidActive(createdBids[0])
      .call({ gas: 6000000, from: accounts[0] });
    console.log("bidActive: ", found);
    assert.strictEqual(found, false, "Bid not active");
  });

  it("Should allow the highest bidder to claim the NFT", async () => {
    var receipt = await BidContract.methods
      .claimNFT(createdBids[0])
      .send({ gas: 6000000, from: accounts[5] });
    assert.strictEqual(receipt !== null, true, "Not claimed");
  });

  it("Should check if the newly claimed token does belong to the new owner", async () => {
    var owner = await TokenContract.methods
      .ownerOf(createdBids[0])
      .call({ gas: 6000000, from: accounts[5] });
    assert.strictEqual(owner === accounts[5], true, "Not claimed");
  });
  it("Should  account[1] to withdraw their bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[1] });
    console.log("receipt: ", receipt.events.LogWithdrawal.returnValues);
    assert.eventEmitted(receipt, "LogWithdrawal");
  });
  it("Should  account[2] to withdraw their bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[2] });
    console.log("receipt: ", receipt.events.LogWithdrawal.returnValues);
    assert.eventEmitted(receipt, "LogWithdrawal");
  });
  it("Should  account[3] to withdraw their bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[3] });
    console.log("receipt: ", receipt.events.LogWithdrawal.returnValues);
    assert.eventEmitted(receipt, "LogWithdrawal");
  });
  it("Should  account[4] to withdraw their bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[4] });
    console.log("receipt: ", receipt.events.LogWithdrawal.returnValues);
    assert.eventEmitted(receipt, "LogWithdrawal");
  });
  it("Should  account[5] to withdraw their bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[5] });
    console.log("receipt: ", receipt.events.LogWithdrawal.returnValues);
    assert.eventEmitted(receipt, "LogWithdrawal");
  });

  it("should get the bid owners balance before withdrawal", async () => {
    var balance = await web3.eth.getBalance(accounts[0]);
    balanceBefore = etherConverter(balance, "wei", "eth");
    console.log("balance before: ", balanceBefore);
  });
  it("Should withdraw current bid", async () => {
    var receipt = await BidContract.methods
      .withdraw(createdBids[0])
      .send({ gas: 6000000, from: accounts[0] });
    assert.eventEmitted(receipt, "LogWithdrawal");
  });
  it("should get the bid owners balance after withdrawal", async () => {
    var balance = await web3.eth.getBalance(accounts[0]);
    balanceAfter = etherConverter(balance, "wei", "eth");
    console.log("balance before: ", balanceAfter);
  });

  it("Should verify the bidOwners balance is greater than before", async () => {
    assert.strictEqual(
      balanceAfter > balanceBefore,
      true,
      "Balance not updated"
    );
  });
  it("Should transfer ownership to the bidding contract", async () => {
    const receipt = await TokenContract.methods
      .transferFrom(accounts[5], BidContract.options.address, 1)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "Transfer");
  });
  it("Should put a token up for bidding second time", async () => {
    var startDate = new bigNumber(
      moment(new Date())
        .add(10, "h")
        .toDate()
        .getTime()
    ).toFixed();
    var endDate = new bigNumber(
      moment(new Date())
        .add(20, "h")
        .toDate()
        .getTime()
    ).toFixed(); //30 minutes from now
    startDate = Math.round(startDate / 1000);
    endDate = Math.round(endDate / 1000);
    console.log("startDate: ", startDate, " endDate: ", endDate);
    var tokenValue = etherConverter(0.0112313, "eth", "wei");
    console.log("tokenValue: ", tokenValue);
    const receipt = await BidContract.methods
      .listToken(1, startDate, endDate, tokenValue)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "BidCreated");
    await increaseTime(1000);
  });
  it("Should cancel the bid", async () => {
    const receipt = await BidContract.methods
      .cancelBid(2)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "CancelledBid");
  });
  it("Should check if the owner owns the token they listed", async () => {
    var owner = await TokenContract.methods
      .ownerOf(1)
      .call({ gas: 6000000, from: accounts[5] });
    assert.strictEqual(owner === accounts[5], true, "Not claimed");
  });
  it("Should transfer ownership to the bidding contract", async () => {
    const receipt = await TokenContract.methods
      .transferFrom(accounts[5], BidContract.options.address, 1)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "Transfer");
  });

  it("Should add should add the newly transffered token to the contract storage",async()=>{
    const receipt = await BidContract.methods
      .storeTransferredToken(1)
      .send({ gas: 6000000, from: accounts[5] });
      assert.eventEmitted(receipt, "AddTokenToEscrow");
  })


  it("Should put a token up for bidding thrid time", async () => {
    var startDate = new bigNumber(
      moment(new Date())
        .add(10, "h")
        .toDate()
        .getTime()
    ).toFixed();
    var endDate = new bigNumber(
      moment(new Date())
        .add(20, "h")
        .toDate()
        .getTime()
    ).toFixed(); //30 minutes from now
    startDate = Math.round(startDate / 1000);
    endDate = Math.round(endDate / 1000);
    console.log("startDate: ", startDate, " endDate: ", endDate);
    var tokenValue = etherConverter(0.0112313, "eth", "wei");
    console.log("tokenValue: ", tokenValue);
    const receipt = await BidContract.methods
      .listToken(1, startDate, endDate, tokenValue)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "BidCreated");
    
    await increaseTime(1000);
  });

  it("Should check if the owner owns the token they listed before", async () => {
    var owner = await TokenContract.methods
      .ownerOf(1)
      .call({ gas: 6000000, from: accounts[5] });
    assert.strictEqual(owner === accounts[5], false, "Not transferred");
  });
  it("Should withdraw token ownership from contract", async () => {
    const receipt = await BidContract.methods
      .widthDrawTokenFromEscrow(1)
      .send({ gas: 6000000, from: accounts[5] });
    assert.eventEmitted(receipt, "RemovedTokenFromEscrow");
  });

  it("Should check if the owner owns the token they listed after", async () => {
    var owner = await TokenContract.methods
      .ownerOf(1)
      .call({ gas: 6000000, from: accounts[5] });
    assert.strictEqual(owner === accounts[5], true, "Not claimed");
  });
});

<template>
  <v-container fluid>
    <v-tabs :color="$store.state.purpleColor" right>
      <v-tab>Mint</v-tab>
      <v-tab>Bids</v-tab>
      <v-tab>Owned</v-tab>
      <v-tab-item key="1">
        <v-container fluid>
          <v-stepper v-model="step" vertical :color="$store.state.purpleColor">
            <v-stepper-step
              :color="$store.state.purpleColor"
              :complete="step > 1"
              step="1"
            >
              NFT Details
              <small>Specify NFT Details</small>
            </v-stepper-step>
            <v-stepper-content step="1">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                  :color="$store.state.purpleColor"
                  v-model="nftName"
                  :rules="nameRules"
                  label="NFT Name"
                  required
                ></v-text-field>
                <v-textarea
                  :color="$store.state.purpleColor"
                  v-model="description"
                  :rules="descriptionRules"
                  label="Description"
                  required
                  counter
                ></v-textarea>
                <v-text-field
                  :color="$store.state.purpleColor"
                  v-model="nftValue"
                  :rules="priceRules"
                  label="NFT Value in Eth"
                  required
                ></v-text-field>
                <v-file-input
                  :color="$store.state.purpleColor"
                  show-size
                  label="Select Image"
                  prepend-icon="mdi-camera"
                  accept=".png, .jpg, .jpeg"
                  v-model="image"
                  :rules="imageRules"
                ></v-file-input>
                <v-btn
                  justify="end"
                  align="end"
                  v-if="valid && image !== {}"
                  :color="$store.state.purpleColor"
                  @click="mintNFT"
                >
                  Continue
                </v-btn>
              </v-form>
            </v-stepper-content>
            <v-stepper-step
              :color="$store.state.purpleColor"
              :complete="step > 2"
              step="2"
            >
              Transfer Ownership to Bidding Contract
            </v-stepper-step>
            <v-stepper-content step="2">
              <v-text-field
                :color="$store.state.purpleColor"
                :value="$store.state.biddingContractAddress"
                label="Bidding Contract Address"
                readonly
              ></v-text-field>
              <v-btn
                :color="$store.state.purpleColor"
                @click="transferOwnership"
              >
                Continue
              </v-btn>
              <v-btn @click="step--" text>
                Cancel
              </v-btn>
            </v-stepper-content>
            <v-stepper-step
              :color="$store.state.purpleColor"
              :complete="step > 3"
              step="3"
            >
              Set Auction Details (Start DateTime)
            </v-stepper-step>
            <v-stepper-content :color="$store.state.purpleColor" step="3">
              <v-container fluid>
                <v-row justify="center">
                  <v-date-picker
                    full-width
                    :color="$store.state.purpleColor"
                    v-model="startDate"
                  ></v-date-picker>
                  <v-spacer></v-spacer>
                  <v-time-picker
                    full-width
                    v-model="startTime"
                    :color="$store.state.purpleColor"
                    format="24hr"
                  ></v-time-picker>
                </v-row>
                <br />
              </v-container>
              <br />
              <v-btn
                v-if="startTime !== null && startTime !== null"
                :color="$store.state.purpleColor"
                @click="step++"
              >
                Continue
              </v-btn>
              <v-btn @click="revertTokenOwnership" text>
                Cancel
              </v-btn>
            </v-stepper-content>
            <v-stepper-step
              :color="$store.state.purpleColor"
              :complete="step > 4"
              step="4"
            >
              Set Auction Details (End DateTime)
            </v-stepper-step>
            <v-stepper-content :color="$store.state.purpleColor" step="4">
              <v-container fluid>
                <v-row justify="center">
                  <v-date-picker
                    full-width
                    :color="$store.state.purpleColor"
                    v-model="endDate"
                  ></v-date-picker>
                  <v-spacer></v-spacer>
                  <v-time-picker
                    full-width
                    v-model="endTime"
                    format="24hr"
                    :color="$store.state.purpleColor"
                  ></v-time-picker>
                </v-row>
                <br />
              </v-container>
              <br />
              <v-btn
                v-if="endDate !== null && endTime !== null"
                :color="$store.state.purpleColor"
                @click="listToken"
              >
                Continue
              </v-btn>
              <v-btn @click="step--" text>
                Back
              </v-btn>
            </v-stepper-content>
          </v-stepper>
        </v-container>
      </v-tab-item>
      <v-tab-item key="2">
        <v-container fluid>
          <v-card flat>
            <v-card-text class="display-5 text--primary"
              >Total Value: {{ totalBidValue }}
              <v-icon class="icon-eth" left>
                mdi-ethereum
              </v-icon></v-card-text
            >
          </v-card>
          <v-row>
            <v-col
              v-for="(nft, index) in $store.state.bidNFTS"
              :key="index"
              cols="12"
              md="4"
            >
              <v-card class="mx-auto" max-width="344">
                <v-img
                  :src="nft.picture"
                  :lazy-src="nft.picture"
                  aspect-ratio="1"
                ></v-img>
                <v-card-title class="name">
                  {{ nft.name }}
                </v-card-title>
                <v-card-subtitle style="text-align:center;">
                  {{ nft.value }}
                  <v-icon class="icon-eth" left>
                    mdi-ethereum
                  </v-icon>
                </v-card-subtitle>
                <v-row
                  style="padding-top:10px; padding-right:20px;"
                  justify="center"
                >
                  <vac
                    style="font-weight:bold; color:black"
                    :end-time="nft.start"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span
                        >Starts In
                        {{
                          `${Math.round(
                            (timeObj.d / 1000 / (3600 * 24)) * 100
                          )} days ${timeObj.h}:${timeObj.m}:${timeObj.s}`
                        }}
                      </span>
                    </template>
                    <template v-slot:finish>
                      <span>Auction in Progress</span>
                    </template>
                  </vac></v-row
                >
                <v-row
                  style="padding-top:10px; padding-right:20px;"
                  justify="center"
                >
                  <vac
                    style="font-weight:bold; color:black"
                    :end-time="nft.expiry"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span
                        >Ends In
                        {{
                          `${timeObj.d} days ${timeObj.h}:${timeObj.m}:${timeObj.s}`
                        }}
                      </span>
                    </template>
                    <template v-slot:finish>
                      <span>Expired!</span>
                    </template>
                  </vac></v-row
                >

                <v-card-actions>
                  <v-btn @click="details(nft)" text>Details </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="nft.wonBid"
                    :color="$store.state.purpleColor"
                    @click="claim(nft)"
                    text
                    >Claim
                  </v-btn>
                  <v-spacer v-if="nft.wonBid"></v-spacer>
                  <v-btn
                    :color="$store.state.purpleColor"
                    @click="withdrawBid(nft)"
                    text
                  >
                    Withdraw Bid
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      <v-tab-item key="3">
        <v-container fluid>
          <v-card flat>
            <v-card-text class="display-5 text--primary"
              >Total Value: {{ totalOwnedValue }}
              <v-icon class="icon-eth" left>
                mdi-ethereum
              </v-icon></v-card-text
            >
          </v-card>
          <v-row>
            <v-col
              v-for="(nft, index) in $store.state.ownedNFTS"
              :key="index"
              cols="12"
              md="4"
            >
              <v-card class="mx-auto" max-width="344">
                <v-img
                  :src="nft.picture"
                  :lazy-src="nft.picture"
                  aspect-ratio="1"
                ></v-img>
                <v-card-title class="name">
                  {{ nft.name }}
                </v-card-title>
                <v-card-subtitle style="text-align:center;">
                  {{ nft.value }}
                  <v-icon class="icon-eth" left>
                    mdi-ethereum
                  </v-icon>
                </v-card-subtitle>
                <v-row
                  style="padding-top:10px; padding-right:20px;"
                  justify="center"
                >
                  <vac
                    style="font-weight:bold; color:black"
                    :end-time="nft.start"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span
                        >Starts In
                        {{
                          `${Math.round(
                            (timeObj.d / 1000 / (3600 * 24)) * 100
                          )} days ${timeObj.h}:${timeObj.m}:${timeObj.s}`
                        }}
                      </span>
                    </template>
                    <template v-slot:finish>
                      <span>Auction in Progress</span>
                    </template>
                  </vac></v-row
                >
                <v-row
                  style="padding-top:10px; padding-right:20px;"
                  justify="center"
                >
                  <vac
                    style="font-weight:bold; color:black"
                    :end-time="nft.expiry"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span
                        >Ends In
                        {{
                          `${timeObj.d} days ${timeObj.h}:${timeObj.m}:${timeObj.s}`
                        }}
                      </span>
                    </template>
                    <template v-slot:finish>
                      <span>Expired!</span>
                    </template>
                  </vac></v-row
                >
                <v-card-actions>
                  <v-btn @click="details(nft)" text>
                    Details
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    :color="$store.state.purpleColor"
                    @click="cancelBid(nft)"
                    text
                  >
                    Cancel Bid
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs>
    <bottom-nav-widget />
    <infinite-loading style="padding-top:100px;" @infinite="getSelected">
    </infinite-loading>
    <transfer-modal-view />
  </v-container>
</template>

<script>
import { startConfetti, stopConfetti } from "../js/confetti.js";
import InfiniteLoading from "vue-infinite-loading";
import BottomNavWidget from "../widgets/bottomNavWidget.vue";
import TransferModalView from "./TransferModalView.vue";
import bigNumber from "bignumber.js";
import etherConverter from "ether-converter";
import axios from "axios";

export default {
  components: {
    InfiniteLoading,
    TransferModalView,
    BottomNavWidget,
  },
  data() {
    return {
      didWin: false,
      nftName: "",
      nameRules: [
        (v) => !!v || "NFT Name required",
        (v) =>
          (v && v.length >= 2) ||
          "NFT Name must be greater than equal to 2 characters",
      ],
      tokenId: 0,
      endTime: null,
      startTime: null,
      imageRules: [(v) => !!v || "Image file required"],
      startDate: null,
      endDate: null,
      nftValue: 0,
      priceRules: [
        (v) => !!v || "NFT Value required",
        (v) =>
          (v && !isNaN(v) && v > 0) ||
          "NFT Value must be a number and greater than 0",
      ],
      step: 1,
      valid: false,
      valid2: false,
      description: "",
      descriptionRules: [
        (v) => !!v || "Description Required",
        (v) =>
          (v && v.length > 50) ||
          "Description must be greater than 50 characters",
      ],
      image: {},
      totalOwnedValue: 0,
      totalBidValue: 0,
    };
  },
  async mounted() {
    console.log("in liked: ", this.$store.state.selectedNFTS);
    await this.getUserPlacedBids();
    this.$store.state.ownedNFTS.map((nft) => {
      this.totalOwnedValue += nft.value;
    });
  },
  methods: {
    claim(nft) {
      let _this = this;
      this.$store.state.isLoading = true;
      this.$store.state.biddingContract.methods
        .withdraw(nft.bidId)
        .send({ from: this.$store.state.userAddress, gas: 6000000 })
        .then(async (receipt, error) => {
          await _this.$store.dispatch("increaseBidsWon");
          startConfetti();
          setTimeout(() => {
            stopConfetti();
          }, 2000);
          _this.$store.state.isLoading = false;
          console.log("claimed NFT: ", receipt);
          _this.$store.dispatch(
            "success",
            "Succesfully claimed NFT Congratulations"
          );
        })
        .catch((error) => {
          _this.$store.state.isLoading = false;
          console.log("error claiming NFT: ", error);
          _this.$store.dispatch(
            "error",
            "Something went wrong while claiming NFT, please ensure the Bidding period has enede and try again!"
          );
        });
    },
    withdrawBid(nft) {
      let _this = this;
      this.$store.state.isLoading = true;
      this.$store.state.biddingContract.methods
        .withdraw(nft.bidId)
        .send({ from: this.$store.state.userAddress, gas: 6000000 })
        .then((receipt, error) => {
          console.log("receipt from widthdrawing funds: ", receipt);
          _this.$store.dispatch(
            "success",
            "Succesfully withdrew your funds from the bidding contract"
          );
          _this.$store.state.isLoading = false;
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.dispatch(
            "error",
            "Something went wrong while withdrawing your funds from the bid!"
          );
          _this.$store.state.isLoading = false;
        });
    },
    revertTokenOwnership() {
      this.$store.state.isLoading = true;
      let _this = this;
      this.$store.state.biddingContract.methods
        .widthDrawTokenFromEscrow(this.tokenId)
        .send({ gas: 6000000, from: this.$store.state.userAddress })
        .then((receipt, error) => {
          console.log("reverted token receipt: ", receipt);
          _this.$store.dispatch(
            "success",
            "Succesfully returned token ownership"
          );
          _this.$store.state.isLoading = false;
          _this.step--;
        })
        .catch((error) => {
          console.log("error reverting token ownership to you: ", error);
          _this.$store.state.isLoading = false;
          _this.$store.dispatch(
            "error",
            "Something went wrong while transferring token ownership back to you please try again!"
          );
          _this.$store.state.isLoading = false;
        });
    },
    listToken() {
      this.$store.state.isLoading = true;
      var tempEndDate = new bigNumber(
        new Date(this.endDate + " " + this.endTime).getTime()
      )
        .dividedBy(new bigNumber(1000))
        .toFixed(0);
      var tempStartDate = new bigNumber(
        new Date(this.startDate + " " + this.startTime).getTime()
      )
        .dividedBy(new bigNumber(1000))
        .toFixed(0);
      if (tempStartDate && tempEndDate && tempEndDate > tempStartDate) {
        let _this = this;
        this.$store.state.biddingContract.methods
          .listToken(
            this.tokenId,
            tempStartDate,
            tempEndDate,
            etherConverter(_this.nftValue, "eth", "wei")
          )
          .send({ gas: 6000000, from: this.$store.state.userAddress })
          .then((receipt, error) => {
            _this.$store.state.isLoading = false;
            _this.$store.dispatch(
              "success",
              "Succesfully listed token for bidding"
            );
            location.reload();
          })
          .catch((error) => {
            console.log("error listing token: ", error);
            _this.$store.state.isLoading = false;
            _this.$store.dispatch(
              "error",
              "Something went wrong while listing token for bidding"
            );
          });
      } else {
        this.$store.state.isLoading = false;
        this.$store.dispatch(
          "error",
          "Start Date and Time must be less than End Date and Time"
        );
        this.step--;
      }
    },
    transferOwnership() {
      if (this.$refs.form.validate()) {
        this.$store.state.isLoading = true;
        let _this = this;
        this.$store.state.tokenContract.methods
          .transferFrom(
            this.$store.state.userAddress,
            this.$store.state.biddingContract.options.address,
            this.tokenId
          )
          .send({ gas: 6000000, from: this.$store.state.userAddress })
          .then(async (receipt, error) => {
            console.log("receipt from transferring ownership: ", receipt);
            await _this.$store.state.biddingContract.methods
              .storeTransferredToken(_this.tokenId)
              .send({ gas: 6000000, from: _this.$store.state.userAddress });
            _this.step++;
            _this.$store.state.isLoading = false;
          })
          .catch((error) => {
            console.log(
              "error transferring ownership to bidding contract: ",
              error
            );
            _this.$store.state.isLoading = false;
            _this.$store.dispatch(
              "error",
              "Something transferring NFT ownership to bidding contract"
            );
          });
      } else {
        console.log("not valid");
      }
      //this.$store.state.isLoading = false;
    },
    mintNFT: async function() {
      this.$store.state.isLoading = true;
      if (this.$refs.form.validate()) {
        let _this = this;
        {
          this.$store.state.isLoading = true;
          this.$store.state.nftDetailsDialog = false;
          const { skylink } = await this.$store.state.skyClient.uploadFile(
            this.image
          );
          console.log("SkyLink: ", skylink);
          var file = new File(
            [
              JSON.stringify({
                picture:
                  "https://siasky.net/" + skylink.substring(4, skylink.length),
                description: _this.description,
                name: _this.nftName,
                time_stamp: new Date().getTime(),
                value: this.nftValue,
              }),
            ],
            "nft.json",
            { type: "text/plain" }
          );
          console.log("file: ", file);
          _this.$store.state.skyClient.uploadFile(file).then((skylink1) => {
            console.log(`Upload successful, skylink1: `, skylink1.skylink);
            console.log(
              "this.$store.state.tokenContract.methods: ",
              _this.$store.state.tokenContract.methods
            );
            _this.$store.state.tokenContract.methods
              .mintToken(
                _this.$store.state.userAddress,
                "https://siasky.net/" +
                  skylink1.skylink.substring(4, skylink1.skylink.length)
              )
              .send({
                gas: 6000000,
                from: _this.$store.state.userAddress,
              })
              .then((receipt, error) => {
                _this.$store.state.isLoading = false;
                console.log(
                  "receipt of sending transaction: ",
                  receipt,
                  " error: ",
                  error
                );
                _this.tokenId = receipt.events.Transfer.returnValues.tokenId;
                console.log("tokenId: ", _this.tokenId);
                _this.step++;
              })
              .catch((error) => {
                console.log("error uploading: ", error);
                _this.$store.state.isLoading = false;
                _this.$store.dispatch(
                  "error",
                  "Something went wrong while minting NFT"
                );
              });
          });
        }
      } else {
        console.log("not valid");
        this.$store.state.isLoading = false;
      }
    },
    getUserPlacedBids() {
      let _this = this;
      if (
        this.$store.state.userAddress === "" ||
        this.$store.state.userAddress === null
      )
        return;
      this.$store.state.bidNFTS = [];
      this.$store.state.isLoading = true;
      this.$store.state.biddingContract.methods
        .getBidderDetails(this.$store.state.userAddress)
        .call({ gas: 6000000, from: this.$store.state.userAddress })
        .then((userDetails, error) => {
          console.log("details in profile: ", userDetails["0"]);
          if (userDetails["0"].length > 0) {
            userDetails["0"].map(async (key, index) => {
              var details = await _this.$store.state.biddingContract.methods
                .getBid(key)
                .call({ gas: 6000000, from: _this.$store.state.userAddress });
              console.log("details of nft: ", details);
              var tokenURI = await _this.$store.state.tokenContract.methods
                .tokenURI(details[5])
                .call({ gas: 6000000, from: _this.$store.state.userAddress });
              var ownedByUser = details[0];
              console.log(
                "tokenURI in Profile: ",
                tokenURI,
                " ownedBy: ",
                ownedByUser
              );
              axios.get(tokenURI).then(async (nftDetails) => {
                console.log("nftdetails found: ", nftDetails.data);
                if (nftDetails.status === 200) {
                  nftDetails = nftDetails.data;
                  console.log("nftDetails: ", nftDetails);
                  nftDetails.value = new bigNumber(
                    etherConverter(details[4], "wei", "eth")
                  ).toNumber(2);
                  nftDetails.tokenId = details[5];
                  nftDetails.expiry = new bigNumber(details[2] * 1000).toNumber(
                    0
                  );
                  var tokenURI = await _this.$store.state.tokenContract.methods
                    .tokenURI(details[5])
                    .call({
                      gas: 6000000,
                      from: _this.$store.state.userAddress,
                    });
                  nftDetails.start = new bigNumber(details[1]).toNumber();
                  nftDetails.tokenAddress = _this.$store.state.tokenAddress;
                  var match =
                    ownedByUser.toUpperCase() ===
                    _this.$store.state.userAddress.toUpperCase();
                  console.log(
                    "ownedByUser.toUpperCase():  ",
                    ownedByUser.toUpperCase(),
                    " _this.$store.state.userAddress.toUpperCase(): ",
                    _this.$store.state.userAddress.toUpperCase(),
                    " match: "
                  );
                  nftDetails.owned = match;
                  nftDetails.bidId = key;
                  nftDetails.wonBid =
                    details[6] === _this.$store.state.userAddress;
                  if (!_this.didWin) _this.didWin = details[6];
                  console.log("nftDetails after: ", nftDetails);
                  _this.$store.state.bidNFTS.push(nftDetails);
                }
              });
              console.log(
                "index === details[0].length - 1: ",
                index,
                userDetails[0]
              );
              if (index === userDetails["0"].length - 1) {
                _this.$store.state.bidNFTS.map((nft) => {
                  _this.totalBidValue += nft.value;
                });
                _this.$store.state.isLoading = false;
              }
            });
          } else {
            _this.$store.state.isLoading = false;
          }
        })
        .catch((error) => {
          console.log("error getting bidder keys: ", error);
          _this.$store.dispatch(
            "error",
            "Something went wrong while fetching your placed bids!"
          );
          _this.$store.state.isLoading = false;
        });
    },
    cancelBid(nft) {
      let _this = this;
      this.$store.state.isLoading = true;
      this.$store.state.biddingContract.methods
        .cancelBid(nft.bidId)
        .send({ from: this.$store.state.userAddress, gas: 6000000 })
        .then((receipt, error) => {
          console.log("receipt from cancelling bid: ", receipt);
          _this.$store.state.isLoading = false;
          //location.reload();
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.state.isLoading = false;
          _this.$store.dispatch(
            "error",
            "Something went wrong while cancelling bid"
          );
        });
    },
    getSelected($state) {
      if (this.$store.state.selectedNFTS.length > 0) {
        $state.loaded();
        $state.complete();
      } else {
        $state.loaded();
        $state.complete();
      }
    },
    list(nft) {
      this.$store.state.isLoading = true;

      this.$store.state.isLoading = false;
    },
    transfer(nft) {
      this.$store.state.transferDialog = true;

      //this.store.state.transferDialog = false;
    },
    details(nft) {
      //console.log("this: ", this.$router.push({ name: "nftdetails" }));
      this.$store.state.selectedNFT = nft;
      //  this.$store.state.bidDialog = true;
      this.$router.push({ path: "/nftdetails" });
    },
  },
};
</script>
<style
  href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.3/darkly/bootstrap.min.css"
  scoped
></style>

<style scoped>
.emoji {
  left: 50%;
  top: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
}
.emoji1 {
  left: 50%;
  top: 54%;
  position: absolute;
  transform: translate(-50%, -50%);
  color: grey;
}
.emoji1 {
  left: 50%;
  top: 100%;
  position: absolute;
  transform: translate(-50%, -50%);
  color: grey;
}
.name {
  margin: 0 auto 30px 0;
  display: block;
  font-size: 24px;
  line-height: 24px;
  text-align: center;
  text-transform: capitalize;
}

.theme-purple {
  color: rgba(221, 71, 209, 0.5);
}
</style>

<template>
  <v-container fluid>
    <v-row v-if="isLoading" class="loading" justify="center" align="center">
      <div class="loading-icon"></div>
    </v-row>
    <v-row v-else class="loading-nothing" justify="center" align="center">
      <div class="loading-icon-nothing">
        Nothing Yet:( try minting a new token under the profile tab
      </div>
    </v-row>
    <v-row justify="center" align="center">
      <v-container class="card-container">
        <card-view
          v-for="(card, index) in cards.data"
          :key="index"
          v-bind:current="index === cards.index"
          v-bind:fullName="card.name"
          v-bind:picture="card.picture"
          v-bind:approved="card.approved"
          v-bind:price="card.value"
          v-bind:expiry="card.expiry"
          v-bind:start="card.start"
          v-on:draggedThreshold="setApproval"
        >
        </card-view>
      </v-container>
    </v-row>
    <bottom-nav-widget />
  </v-container>
</template>

<script>
import BottomNavWidget from "../widgets/bottomNavWidget.vue";
import CardView from "./CardView.vue";
import { LoremIpsum } from "lorem-ipsum";
import axios from "axios";
import bigNumber from "bignumber.js";
import etherConverter from "ether-converter";
export default {
  components: { CardView, BottomNavWidget },
  data: () => {
    return {
      isLoading: true, // Toggles the loading overlay
      cards: { data: [], index: 0, max: 10 },
    };
  },

  methods: {
    getData: async function() {
      const { cards } = this;
      cards.data = [];
      this.isLoading = true;
      let _this = this;
      this.$store.state.biddingContract.methods
        .getBidIds()
        .call({ gas: 6000000, from: this.$store.state.userAddress })
        .then(async (keys, error) => {
          console.log("bidKeys Found: ", keys);
          if (keys.length > 0) {
            keys.map(async (key, index) => {
              var details = await _this.$store.state.biddingContract.methods
                .getBid(key)
                .call({ gas: 6000000, from: _this.$store.state.userAddress });
              console.log("details of nft: ", details);
              var tokenURI = await _this.$store.state.tokenContract.methods
                .tokenURI(details[5])
                .call({ gas: 6000000, from: _this.$store.state.userAddress });
              var ownedByUser = details[0];
              console.log("tokenURI: ", tokenURI, " ownedBy: ", ownedByUser);
              axios.get(tokenURI).then((nftDetails) => {
                console.log("nftdetails found: ", nftDetails.data);
                if (nftDetails.status === 200) {
                  nftDetails = nftDetails.data;
                  console.log("nftDetails: ", nftDetails);
                  nftDetails.value = new bigNumber(
                    etherConverter(details[4], "wei", "eth")
                  ).toNumber(2);
                  nftDetails.tokenId = details[5];
                  nftDetails.expiry = new bigNumber(details[2])
                    .multipliedBy(new bigNumber(1000))
                    .toNumber(0);
                  nftDetails.start = new bigNumber(details[1])
                    .multipliedBy(new bigNumber(1000))
                    .toNumber(0);
                  nftDetails.tokenAddress = _this.$store.state.tokenAddress;
                  var match =
                    ownedByUser.toUpperCase() ===
                    _this.$store.state.userAddress.toUpperCase();
                  nftDetails.owned = match;
                  nftDetails.bidId = key;
                  console.log("NFTDetails: ", nftDetails);
                  if (match) {
                    _this.$store.state.ownedNFTS.push(nftDetails);
                  } else {
                    var temp = this.$store.state.selectedNFTS.filter(
                      (nft) => nft.tokenId === nftDetails.tokenId
                    );
                    if (temp.length === 0) {
                      cards.data.push(nftDetails);
                    }
                  }
                }
              });

              if (index === keys.length - 1) {
                 cards.data = cards.data.sort((a, b) => a.start - b.start);
                _this.isLoading = false;
              }
            });
          } else {
            //cards.data = [];
            _this.isLoading = false;
          }
          if (cards.data.length === 0) {
            _this.isLoading = true;
          }
        })
        .catch((error) => {
          console.log("error fetching nft bid ids: ", error);
          cards.data = [];
          _this.isLoading = false;
        });
    },
    setApproval(approval) {
      /*
      	Change approval value for current card, and request new data
      	if at the end of the card array
      */
      const { cards, getData } = this;

      cards.data[cards.index].approved = approval;
      this.$store.state.likedNFT.push(cards.data[cards.index]);
      cards.index++;
      if (cards.index >= cards.data.length) {
        getData();
      }
    },
  },

  mounted() {
    this.getData();
  },
};
</script>

<style scoped>
.card .stars .active,
.card .stars .inactive,
.card .image {
  background: center center no-repeat transparent;
  background-size: contain;
}

html {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  color: #444;
  overflow: hidden;
  background: #f3f3f3;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -moz-font-feature-settings: "liga" on;
}

*,
*:before,
*:after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.loading .loading-icon:before,
.loading .loading-icon:after,
.loading .loading-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -62.5px;
  margin-top: -62.5px;
}

.loading .loading-icon:before,
.loading .loading-icon:after {
  width: 125px;
  height: 125px;
  border-radius: 50%;
  border: 4px solid #fff;
}

.loading {
  z-index: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(240, 141, 231, 0.5);
}
.loading .loading-icon {
  width: 125px;
  height: 125px;
}
.loading .loading-icon:before,
.loading .loading-icon:after {
  content: "";
  display: block;
}
.loading .loading-icon:before {
  z-index: 0;
  -webkit-animation: 1s pulse infinite linear;
  animation: 1s pulse infinite linear;
}
.loading .loading-icon:after {
  z-index: 10;
  background: url("https://www.forbes.com/advisor/wp-content/uploads/2021/04/NFT.jpeg-900x510.jpg")
    center center no-repeat #fff;
  background-size: cover;
}
/**loading nothing styling */
.loading-nothing .loading-icon-nothing:before,
.loading-nothing .loading-icon-nothing:after,
.loading-nothing .loading-icon-nothing {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -62.5px;
  margin-top: -62.5px;
}

.loading-nothing .loading-icon-nothing:before,
.loading-nothing.loading-icon-nothing:after {
  width: 125px;
  height: 125px;
  border-radius: 50%;
  border: 4px solid #fff;
}

.loading-nothing {
  z-index: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
}
.loading-nothing .loading-icon-nothing {
  width: 125px;
  height: 125px;
}
.loading-nothing .loading-icon-nothing:before,
.loading-nothing .loading-icon-nothing:after {
  content: "";
  display: block;
}
.loading-nothing .loading-icon-nothing:before {
  z-index: 0;
  -webkit-animation: 1s pulse infinite linear;
  animation: 1s pulse infinite linear;
}
.loading-nothing .loading-icon-nothing:after {
  z-index: 0;
  background: url("https://i.pinimg.com/originals/5f/5d/43/5f5d433acab07ca53f33dc4060168f3d.jpg")
    center center no-repeat rgb(255, 255, 255);
  background-size: cover;
}
@-webkit-keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}
.card-container {
  position: relative;
  width: 420px;
  height: 660px;
}

.card {
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  left: 0;
  top: 0;
  position: absolute;
  padding: 15px 15px 30px;
  width: 420px;
  height: 550px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: translateY(30px) scale(0.94);
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}
.card:nth-child(1) {
  opacity: 1;
  z-index: 3;
  transform: translateY(0px) scale(1);
}
.card:nth-child(2) {
  opacity: 1;
  z-index: 2;
  transform: translateY(10px) scale(0.98);
}
.card:nth-child(3) {
  opacity: 1;
  z-index: 1;
  transform: translateY(20px) scale(0.96);
}
.card.current {
  pointer-events: auto;
}
.card.animated {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.card .image {
  margin: 0 auto 30px 0;
  width: 390px;
  height: 390px;
}
.card .image .image-icon {
  position: relative;
  left: 50%;
  top: 50%;
  width: 200px;
  height: 200px;
  transform: translateX(-50%) translateY(-50%);
  background: center center no-repeat transparent;
  background-size: contain;
}
.card .image .image-icon.match {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/icon-approve.svg");
}
.card .image .image-icon.pass {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/icon-reject.svg");
}
.card .name {
  margin: 0 auto 30px 0;
  display: block;
  font-size: 24px;
  line-height: 24px;
  text-align: center;
  text-transform: capitalize;
}
.card .price {
  margin: 0 auto 30px 0;
  display: block;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  text-transform: capitalize;
  color: gray;
}
.card .icon-eth {
  height: 2px;
}
</style>

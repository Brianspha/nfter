import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
const { SkynetClient, genKeyPairFromSeed } = require("skynet-js");
import biddingContract from "../../contracts/embarkArtifacts/contracts/BidContract";
import tokenContract from "../../contracts/embarkArtifacts/contracts/TokenContract";
import swal from "sweetalert2";
import {
  createNewClient,
  getAllPebbles,
  getThread,
  updatePebble,
  createEntity,
  setup
} from "../textile/textile"
Vue.use(Vuex);
console.log("biddingContract.options.address: ",biddingContract.options.address)
/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    likedNFT:[],
    userAddress:"",
    connected:false,
    tokenAddress:tokenContract.options.address,
    biddingContract: biddingContract,
    biddingContractAddress:biddingContract.options.address,
    tokenContract:tokenContract,
    skyClient: new SkynetClient("https://siasky.net/"),
    ownedNFTS:[],
    bidNFTS:[],
    selectedNFT:{},
    bidDialog: false,
    currentPrice: 0,
    transferDialog: false,
    isLoading: false,
    whiteColor: "white",
    purpleColor: `rgba(221, 71, 209, 0.5)`,
    selectedNFTS: [],
    tabActive: true,
    selectedTab: 0,
    primaryColor: "black accent-1",
    tabs: [
      {
        name: "Market",
        icon: "mdi-fire",
        to: "/market",
        count:0
      },
      {
        name: "Liked",
        icon: "mdi-star-four-points",
        to: "/liked",
        count:0
      },
      {
        name: "Profile",
        icon: "mdi-account",
        to: "/profile",
        count:0
      },
      {
        name: "Leaderboard",
        icon: "mdi-ladder",
        to: "/leaderBoard",
        count:0
      },
    ],
  },
  plugins: [createPersistedState()],
  modules: {},
  actions: {
    success(context, message) {
      console.log("shwoing success message: ", message);
      swal.fire("Success", message, "success");
    },
    error(context, message) {
      console.log("shwoing error message: ", message);
      swal.fire("Error!", message, "error");
    },
    successWithFooter(context, message) {
      console.log("shwoing successWithFooter message: ", message);
      swal.fire({
        icon: "success",
        title: "Success",
        text: message.message,
        footer: `<a href= https://testnet.bscscan.com/tx/${message.txHash}> View on Binance Explorer</a>`,
      });
    },
    errorWithFooterMetamask(context, message) {
      console.log("shwoing successWithFooter message: ", message);
      swal.fire({
        icon: "error",
        title: "Error!",
        text: message,
        footer: `<a href= https://metamask.io> Download Metamask</a>`,
      });
    },
    getTextileData: async function () {
      var pebbles = await getAllPebbles()
      return pebbles
    },
    saveTextileData: async function (context, data) {
      console.log("saving textile data: ", data);
      await updatePebble([data])
    },
    createNewTextTileData: async function (context, data) {
      var createdData = await createEntity(data)
      return true
    },
    loadData: async function () {
      console.log("fetching data");
      store.state.leaderBoard = [];
      store.state.isLoading = true;
      var content = await this.dispatch("getTextileData");
      content = content[0]
      store.state.leaderBoard=content.leaderboard
      return content

    },
    async increaseBidsWon(){
      var data = await this.dispatch("loadData")
      console.log("data: ",data)
      var leaderboard=data.leaderboard
      var found = false;
      leaderboard=leaderboard.map((user)=>{
        if(user.address === this.state.userAddress){
          user.bidsWon +=1
          found=true
        }
        return user
      })
      if(!found){
        leaderboard.push({
          address:this.state.userAddress,
          bidsWon:1
        })
      }
      data.leaderboard=leaderboard
      await this.dispatch("saveTextileData",data)

    }
  },
});

export default store;

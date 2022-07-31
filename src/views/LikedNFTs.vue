<template>
  <v-container fluid>
    <v-row
      v-if="$store.state.likedNFT.length === 0"
      justify="center"
      align="center"
      class="emoji"
    >
      <v-card flat>
        <v-icon>mdi-emoticon-sad-outline</v-icon>
      </v-card>
    </v-row>
    <v-row style="padding-bottom: 30px;" v-else>
      <v-col
        v-for="(nft, index) in $store.state.likedNFT"
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
            <v-row style="padding-top:10px;padding-bottom:10px;" justify="center">
        <vac style="font-weight:bold; color:black" :end-time="nft.expiry">
          <template v-slot:process="{ timeObj }">
            <span>
              Ends In
              {{
                `${(timeObj.d)
                          }  days ${
                  timeObj.h
                }:${timeObj.m}:${timeObj.s}`
              }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Expired!</span>
          </template>
        </vac></v-row
      >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :color="$store.state.purpleColor" @click="details(nft)" text>
              Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <infinite-loading style="padding-top:100px;" @infinite="getSelected">
    </infinite-loading>
    <bottom-nav-widget />
  </v-container>
</template>

<script>
import InfiniteLoading from "vue-infinite-loading";
import BottomNavWidget from "../widgets/bottomNavWidget.vue";
var moment = require("moment");

export default {
  components: {
    InfiniteLoading,
    BottomNavWidget,
  },
  data(){
    return {
      moment:moment
    }
  },
  mounted() {
    console.log("in liked: ", this.$store.state.likedNFT);
  },
  methods: {
    getSelected($state) {
      if (this.$store.state.likedNFT.length > 0) {
        $state.loaded();
        $state.complete();
      } else {
        $state.loaded();
        $state.complete();
      }
    },
    details(nft) {
      this.$store.state.selectedNFT = nft;
      //  this.$store.state.bidDialog = true;
      this.$router.push({ path: "/nftdetails" });
    },
  },
};
</script>

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
</style>

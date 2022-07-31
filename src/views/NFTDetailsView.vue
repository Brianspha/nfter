<template>
  <v-container fluid>
    <v-card class="mx-auto" max-width="95%">
      <v-row justify="center" align="center"
        ><v-img
          :src="$store.state.selectedNFT.picture"
          :lazy-src="$store.state.selectedNFT.picture"
          contain
          aspect-ratio="2.5"
        ></v-img
      ></v-row>
      <v-card-title style="text-align:center;" class="name">
        {{ $store.state.selectedNFT.name }}
      </v-card-title>
      <v-card-subtitle style="text-align:center;">
        {{ $store.state.selectedNFT.value }}
        <v-icon class="icon-eth" left>
          mdi-ethereum
        </v-icon>
      </v-card-subtitle>
      <v-row style="padding-top:10px;" justify="center">
        <vac
          style="font-weight:bold; color:black"
          :end-time="$store.state.selectedNFT.start"
        >
          <template v-slot:process="{ timeObj }">
            <span
              >Starts In
              {{ `${timeObj.d}  days ${timeObj.h}:${timeObj.m}:${timeObj.s}` }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Auction in Progress</span>
          </template>
        </vac></v-row
      >
      <v-row style="padding-top:10px;" justify="center">
        <vac
          style="font-weight:bold; color:black"
          :end-time="$store.state.selectedNFT.expiry"
        >
          <template v-slot:process="{ timeObj }">
            <span
              >Ends In
              {{ `${timeObj.d}  days ${timeObj.h}:${timeObj.m}:${timeObj.s}` }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Expired!</span>
          </template>
        </vac></v-row
      >
      <v-card-text> {{ $store.state.selectedNFT.description }} </v-card-text>
      <v-card-actions>
        <v-btn @click="back" text>
          Back
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!$store.state.selectedNFT.owned"
          :color="$store.state.purpleColor"
          @click="bid()"
          text
        >
          Bid
        </v-btn>
        <v-btn
          v-if="$store.state.selectedNFT.owned"
          :color="$store.state.purpleColor"
          @click="transfer()"
          text
        >
          Transfer
        </v-btn>
      </v-card-actions>
    </v-card>
    <bid-model-widget />
  </v-container>
</template>

<script>
import BidModelWidget from "./BidModelWidget.vue";
import moment from "moment";
export default {
  components: { BidModelWidget },
  data() {
    return {
      moment: moment,
    };
  },
  mounted() {
    console.log("selectedNFT: ", this.$store.state.selectedNFT);
  },
  methods: {
    transfer() {
      this.$store.state.transferDialog = true;
    },
    bid() {
      // this.$store.state.isLoading = true;
      this.$store.state.bidDialog = true;
    },

    back() {
      this.$router.go(-1);
    },
  },
};
</script>
<style></style
><style scoped>
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

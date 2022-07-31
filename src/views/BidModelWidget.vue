<template>
  <v-row justify="center">
    <v-dialog v-model="$store.state.bidDialog" max-width="344">
      <v-card>
        <v-card-title class="headline"> Bid For NFT </v-card-title>
        <v-container fluid>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              label="Current Price"
              v-model="$store.state.selectedNFT.value"
              readonly
            >
            </v-text-field>
            <v-text-field
              label="Your Bid Price"
              :rules="numberRules"
              v-model="number"
            >
            </v-text-field></v-form
        ></v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="close">
            Close
          </v-btn>
          <v-btn
            v-if="valid && number >= $store.state.selectedNFT.value"
            :color="$store.state.purpleColor"
            text
            @click="placeBid"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import utils from "web3-utils";
import etherConverter from "ether-converter";
export default {
  data: () => {
    return {
      number: 0,
      currentPrice: 0,
      numberRules: [
        (v) => !!v || "Bid Price required",
        (v) =>
          (v && !isNaN(v) && parseFloat(v) > 0) ||
          "Invalid Bid Price must be greater than 0",
      ],
      valid: false,
      address: "",
      addressRules: [
        (v) => !!v || "Address is required",
        (v) => (v && utils.isAddress(v)) || "Invalid address",
      ],
    };
  },
  methods: {
    close() {
      this.$store.state.bidDialog = false;
      this.$store.state.isLoading = false;
    },
    placeBid() {
      if (this.$refs.form.validate()) {
        this.$store.state.isLoading = true;
        this.$store.state.bidDialog = false;
        let _this = this;
        console.log("_this.$store.state.selectedNFT: ",_this.$store.state.selectedNFT)
        this.$store.state.biddingContract.methods
          .placeBid(_this.$store.state.selectedNFT.bidId)
          .send({
            gas: 6000000,
            from: _this.$store.state.userAddress,
            value: etherConverter(_this.number, "eth", "wei"),
          })
          .then((receipt, error) => {

            this.$store.state.isLoading = false;
            _this.$store.dispatch("success", "Succesfully placed bid");
            location.reload();
          })
          .catch((error) => {
            this.$store.state.isLoading = false;
            console.log("error placing bid: ", error);
            _this.$store.dispatch("error", "Something went wrong while placing bid");
          });
      } else {
      }
    },
  },
};
</script>

<style></style>

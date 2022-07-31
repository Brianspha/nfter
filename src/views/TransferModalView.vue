<template>
  <v-row justify="center">
    <v-dialog v-model="$store.state.transferDialog" max-width="344">
      <v-card>
        <v-card-title class="headline"> Transfer NFT </v-card-title>
        <v-container fluid>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              label="Address"
              counter="42"
              :rules="addressRules"
              v-model="address"
            >
            </v-text-field></v-form
        ></v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="$store.state.transferDialog = false">
            Close
          </v-btn>
          <v-btn
            v-if="valid"
            :color="$store.state.purpleColor"
            text
            @click="transfer"
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
export default {
  data: () => {
    return {
      valid: false,
      address: "",
      addressRules: [
        (v) => !!v || "Address is required",
        (v) => (v && utils.isAddress(v)) || "Invalid address",
      ],
    };
  },
  methods: {
    transfer() {
      if (this.$refs.form.validate()) {
        _this.$store.state.isLoading = true;
        let _this = this;
        _this.$store.state.biddingContract.methods
          .transferFrom(
            this.$store.state.userAddress,
            this.address,
            this.$store.state.selectedNFT.tokenId
          )
          .send({ from: this.$store.state.userAddress, gas: 6000000 })
          .then((receipt, error) => {
            console.log("receipt: ", receipt);
            _this.$store.dispatch(
              "success",
              "Succesfully transferred token :)"
            );
            _this.$store.state.isLoading = false;
            _this.$store.state.transferDialog = false;
          })
          .catch((error) => {
            console.log("error transferring token: ", error);
            _this.$store.state.isLoading = false;
            _this.$store.dispatch(
              "error",
              "Something went wrong while transferring the token"
            );
          });
      } else {
      }
    },
  },
};
</script>

<style></style>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="users"
        class="elevation-1"
        :search="search"
        :sort-by="['bidsWon']"
        :sort-desc="[true]"
      ></v-data-table>
    </v-card>
    <bottom-nav-widget />
  </v-container>
</template>

<script>
import BottomNavWidget from "../widgets/bottomNavWidget.vue";
export default {
  components: {
    BottomNavWidget,
  },
  data: () => ({
    search: "",
    users: [
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
      {
        address: "0x69A67d679A58115631C365b972fa63C171998a7E",
        bidsWon: Math.round(Math.random() * 1000),
      },
    ],
    headers: [
      { text: "User", value: "address" },
      { text: "Bids won", value: "bidsWon" },
    ],
  }),
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.$store.state.isLoading = true;
      const appData = await this.$store.dispatch("loadData");
      this.users = appData.leaderboard;
      this.$store.state.isLoading = false;
    },
  },
};
</script>

<style></style>

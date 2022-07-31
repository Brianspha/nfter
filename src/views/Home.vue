<template>
  <v-container fluid>
    <v-content>
      <v-container class="box" :active.sync="tab"> asdad</v-container>
      <v-container :active.sync="tab" class="box"> asdaaaasd</v-container>
      <v-container :active.sync="tab" class="box"> asaadas</v-container>
    </v-content>
    <v-bottom-navigation
      :active.sync="tab"
      :value="tab"
      color="primary"
      absolute
      fixed
    >
      <v-btn v-for="(icon, index) in tabs" :key="index" :to="icon.to">
        {{ icon.name }} <v-icon>{{ icon.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-container>
</template>

<script>
export default {
  name: "Home",

  data: () => {
    return {
      tab: null,
      tabs: [
        {
          name: "Market",
          icon: "mdi-fire",
          to: "/market",
        },
        {
          name: "Liked",
          icon: "mdi-star-four-points",
          to: "/liked",
        },
        {
          name: "Profile",
          icon: "mdi-account",
          to: "/profile",
        },
      ],
    };
  },
};
</script>

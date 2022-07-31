<template>
  <v-bottom-navigation
    shift
    :v-model="$store.state.selectedTab"
    :input-value="$store.state.tabActive"
    :color="$store.state.purpleColor"
    absolute
    fixed
  >
    <v-btn
      v-for="(icon, index) in $store.state.tabs"
      :key="index"
      :to="icon.to"
    >
      {{ icon.name }} <v-icon>{{ icon.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
export default {};
</script>

<style></style>

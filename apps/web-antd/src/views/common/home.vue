<script lang="ts" setup>
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content> Home </template>

    <template #footer> 123 </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}
</style>

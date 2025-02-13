<script lang="ts" setup>
import { DatePicker } from 'ant-design-vue';

import HourLivePage from '#/views/template/common.vue';
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <DatePicker />
      </template>
    </HourLivePage>
  </div>
</template>

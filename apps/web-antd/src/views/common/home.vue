<script lang="ts" setup>
import { AccessControl } from '@vben/access';

import HourLivePage from '#/views/template/common.vue';

import AgencyHome from '../agency/home.vue';
import CustomerHome from '../customer/home.vue';
import SuperHome from '../super/home.vue';
</script>
<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <AccessControl :codes="['super']">
        <SuperHome />
      </AccessControl>

      <AccessControl :codes="['agency']">
        <AgencyHome />
      </AccessControl>

      <AccessControl :codes="['customer']">
        <CustomerHome />
      </AccessControl>
    </template>

    <template #footer> </template>
  </HourLivePage>
</template>

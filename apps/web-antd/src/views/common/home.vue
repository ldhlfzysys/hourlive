<script lang="ts" setup>
import { AccessControl } from '@vben/access';

import AgencyHome from '../agency/home.vue';
import CustomerHome from '../customer/home.vue';
import SuperHome from '../super/home.vue';
</script>

<template>
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

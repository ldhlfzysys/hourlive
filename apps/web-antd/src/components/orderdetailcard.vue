<script lang="ts" setup>
import type { TimeslotOrder } from '#/types';

import { $t } from '@vben/locales';

import dayjs from 'dayjs';

defineOptions({
  name: 'OrderDetailCard',
});

const props = defineProps<{
  timeslotOrder: TimeslotOrder;
}>();

const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm');
};
</script>

<template>
  <div class="mb-4 rounded-lg border bg-white p-4 shadow-sm">
    <div class="mb-3">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-lg font-medium"
          >{{ $t('orderid') }}: {{ timeslotOrder.id }}</span
        >
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <span class="text-gray-600">{{ $t('customer') }}:</span>
          <span class="ml-2">{{ timeslotOrder.customer?.code }}</span>
        </div>
        <div>
          <span class="text-gray-600">{{ $t('agency') }}:</span>
          <span class="ml-2">{{ timeslotOrder.agency?.name }}</span>
        </div>
      </div>
    </div>

    <div class="border-t pt-3">
      <div class="mb-2 text-gray-600">{{ $t('timeslots') }}:</div>
      <div class="space-y-2">
        <div
          v-for="slot in timeslotOrder.timeslots"
          :key="slot.id"
          class="rounded bg-gray-50 p-2"
        >
          {{ formatTime(slot.begin_date) }} - {{ formatTime(slot.finish_date) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}
</style>

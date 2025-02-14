<script lang="ts" setup>
import { computed } from 'vue';

import { Button, Divider, RangePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

import AISchedulingModal from '#/components/aiSchedulingModal.vue';
import { useSchedulingStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const schedulingStore = useSchedulingStore();

const ranges = computed(() => {
  const now_date = dayjs();
  return {
    'Next 7 Days': [now_date, now_date.add(7, 'days')] as [
      dayjs.Dayjs,
      dayjs.Dayjs,
    ],
    'Next 15 Days': [now_date, now_date.add(15, 'days')] as [
      dayjs.Dayjs,
      dayjs.Dayjs,
    ],
    'Next Month': [now_date, now_date.add(1, 'month')] as [
      dayjs.Dayjs,
      dayjs.Dayjs,
    ],
    Today: [now_date, now_date] as [dayjs.Dayjs, dayjs.Dayjs],
  };
});
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div class="flex items-center justify-between space-x-4 p-1">
          <RangePicker :ranges="ranges" class="w-[300px]" />
          <Button
            type="primary"
            @click="schedulingStore.showAISchedulingModal = true"
          >
            AI排班
          </Button>
        </div>
        <Divider />
      </template>
      <template #content>
        <div class="flex">
          <div class="w-1/7">
            <div class="flex items-center justify-center border">
              <Button type="primary">主播统计排班</Button>
            </div>
          </div>
          <div class="w-6/7">
            <!-- Right side content -->
          </div>
        </div>
      </template>
    </HourLivePage>
    <AISchedulingModal />
  </div>
</template>

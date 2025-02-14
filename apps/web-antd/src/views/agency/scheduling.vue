<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import { Avatar, Button, Divider, RangePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

import AISchedulingModal from '#/components/aiSchedulingModal.vue';
import { useSchedulingStore, useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const schedulingStore = useSchedulingStore();
const streamerStore = useStreamerStore();
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

onMounted(() => {
  streamerStore.queryStreamer();
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
            <div class="flex h-full flex-col items-center border p-4">
              <Button type="primary">主播统计排班</Button>
              <Avatar
                v-for="streamer in streamerStore.streamerList"
                :key="streamer.id"
                :size="70"
                :src="streamer.avatar"
                class="m-2 shadow-md"
              />
            </div>
          </div>
          <div class="w-6/7 max-h-[800px]"></div>
        </div>
      </template>
    </HourLivePage>
    <AISchedulingModal />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import FullCalendar from '@fullcalendar/vue3';
import { Avatar, Button, Divider, RangePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

import AISchedulingModal from '#/components/AISchedulingModal.vue';
import { useRoomStore, useSchedulingStore, useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const schedulingStore = useSchedulingStore();
const streamerStore = useStreamerStore();
const roomStore = useRoomStore();

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

function handleBrandClick(brandId: string) {
  schedulingStore.selectedBrandId =
    schedulingStore.selectedBrandId === brandId ? undefined : brandId;
}

onMounted(() => {
  streamerStore.queryStreamer();
  schedulingStore.queryBrand();
  roomStore.queryRoom();
});
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div class="flex items-center justify-between space-x-4 p-1">
          <RangePicker
            v-model:value="schedulingStore.dateRange"
            :ranges="ranges"
            class="w-[300px]"
          />
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
            <div class="flex min-h-[500px] flex-col items-center border p-4">
              <Button type="primary">主播统计排班</Button>
              <Avatar
                v-for="streamer in streamerStore.streamerList"
                :key="streamer.id"
                :class="{
                  'clicked-avatar':
                    schedulingStore.selectedStreamId === streamer.id,
                }"
                :size="70"
                :src="streamer.avatar"
                class="m-2 mt-4 shadow-md"
                @click="
                  schedulingStore.selectedStreamId =
                    schedulingStore.selectedStreamId === streamer.id
                      ? undefined
                      : streamer.id
                "
              />
            </div>
          </div>
          <div class="w-full">
            <div class="flex w-full flex-row items-center p-4">
              <Button class="h-auto" ghost type="primary">
                <span>品牌<br />日历</span>
              </Button>

              <Divider style="height: 50px" type="vertical" />

              <div class="flex flex-row items-center space-x-2 overflow-x-auto">
                <Button
                  v-for="brand in schedulingStore.brandList as Array<{
                    id: string;
                    name: string;
                  }>"
                  :key="brand.id"
                  :ghost="
                    schedulingStore.selectedBrandId
                      ? brand.id !== schedulingStore.selectedBrandId
                      : true
                  "
                  type="primary"
                  @click="handleBrandClick(brand.id)"
                >
                  {{ brand.name }}
                </Button>
              </div>
            </div>

            <div class="ml-4 h-[1px] w-full bg-gray-300"></div>
            <div class="ml-4 h-full">
              <FullCalendar :options="schedulingStore.calendarOptions" />
            </div>
          </div>
        </div>
      </template>
    </HourLivePage>
    <AISchedulingModal />
  </div>
</template>

<style>
.fc-license-message {
  display: none;
}

.clicked-avatar {
  box-shadow: 0 0 10px 5px rgb(0 123 255 / 50%); /* 光晕效果 */
}
</style>

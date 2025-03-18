<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import FullCalendar from '@fullcalendar/vue3';
import { RangePicker } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';

import logo from '#/assets/images/logo.png';
import CustomerModal from '#/components/CustomerModal.vue';
import SelectFilter from '#/components/selectfilter.vue';
import StreamerForm from '#/components/streamerform.vue';
import { useAgencyStore, useRoomStore, useSchedulingStore, useStreamerStore } from '#/store';

const schedulingStore = useSchedulingStore();
const streamerStore = useStreamerStore();
const roomStore = useRoomStore();
const agencyStore = useAgencyStore();
const calendarRef = ref(null);
const route = useRoute();
const code = computed(() => route.params.code as string);

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

function handleBrandClick(brandId: number) {
  schedulingStore.selectedBrandId =
    schedulingStore.selectedBrandId === brandId ? undefined : brandId;
}

function handleCalendarChange(date: [Dayjs, Dayjs]) {
  const calendarApi = calendarRef.value.getApi();
  calendarApi.gotoDate(date[0].format('YYYY-MM-DD'));

  // 查询新时间范围内的时间段
  // schedulingStore.queryTimeslots({
  //   begin_date: date[0].format('YYYY-MM-DD'),
  //   finish_date: date[1].format('YYYY-MM-DD'),
  // });
}


onMounted(async () => {
  schedulingStore.readonly = true;
  await schedulingStore.queryPublicTimeslots(code.value);
  await schedulingStore.initCalendar();
  // await agencyStore.fetchAgency();
  
  // 初始化时查询时间段
  // schedulingStore.queryTimeslots({
  //   begin_date: schedulingStore.dateRange[0].format('YYYY-MM-DD'),
  //   finish_date: schedulingStore.dateRange[1].format('YYYY-MM-DD'),
  // });
});

const currentAgency = computed(() => agencyStore.allAgency[0]);
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- 合作区域 -->
    <div v-if="currentAgency" class="p-4 border-b bg-gray-50">
      <div class="container mx-auto flex items-center justify-center space-x-8">
        <div class="flex items-center space-x-4">
          <img 
            :alt="currentAgency.name" 
            :src="currentAgency.user?.avatar"
            class="w-10 h-10"
          />
          <span class="text-lg font-medium">{{ currentAgency.name }}</span>
        </div>
        <div class="h-8 w-px bg-gray-300"></div>
        <div class="flex items-center">
          <img :src="logo" alt="HourLive Logo" class="h-8" />
          <span class="ml-2 text-lg font-medium">小时播</span>
        </div>
      </div>
    </div>

    <!-- 头部区域 -->
    <div class="p-4 border-b">
      <div class="flex items-center justify-between space-x-4">
        <RangePicker
          v-model:value="schedulingStore.dateRange"
          :ranges="ranges"
          class="w-[300px]"
          @change="handleCalendarChange"
        />

        <div class="flex flex-grow items-center justify-end space-x-4">
          <SelectFilter
            v-model="schedulingStore.selectedRoomIds"
            :options="roomStore.roomOptions"
            placeholder="过滤显示的直播间"
            title="过滤直播间"
          />

          <SelectFilter
            v-model="schedulingStore.selectedStreamerIds"
            :options="streamerStore.streamerOptions"
            placeholder="过滤显示的主播"
            title="过滤主播"
          />
        </div>
      </div>
    </div>

    <!-- 日历区域 -->
    <div class="flex-1 p-2 overflow-auto">
      <FullCalendar
        ref="calendarRef"
        :options="{
          ...schedulingStore.calendarOptions,
          height: 'auto',
          contentHeight: 'auto',
          selectable: false,
          editable: false,
          eventStartEditable: false,
          eventDurationEditable: false,
          dragScroll: false,
          droppable: false,
          eventDragStart: null,
          eventDragStop: null,
          eventDrop: null,
        }"
      />
    </div>

    <CustomerModal />
    <StreamerForm />
  </div>
</template>

<style>
.fc-license-message {
  display: none;
}

.fc-event {
  background: none !important;
  border: none !important;
}

.fc-event-main {
  background: none !important;
  border: none !important;
}

.fc-event-selected {
  box-shadow: none !important;
}

.fc-event:focus {
  box-shadow: none !important;
}

.clicked-avatar {
  box-shadow: none !important;
}

.rounded-full {
  border-radius: 50%;
}

.border-dashed {
  border-style: dashed;
}

.fc {
  min-height: 600px !important;
}

.fc .fc-view-harness {
  min-height: 600px !important;
}

.fc .fc-scroller {
  overflow: visible !important;
}

.fc .fc-scroller-liquid-absolute {
  position: static !important;
}

.fc .fc-timegrid-body {
  min-height: 600px !important;
}

.fc .fc-timegrid-slots {
  min-height: 600px !important;
}

/* 移除固定高度限制 */
.fc .fc-view-harness-active > .fc-view {
  position: static !important;
}

/* 允许容器滚动 */
.fc-scroller-liquid {
  overflow: visible !important;
}

/* 移除页面的 overflow: hidden */
body {
  overflow: auto;
}

/* 确保时间格子正常显示 */
.fc-timegrid-event-harness {
  position: absolute !important;
}

/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar,
.overflow-x-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track,
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb,
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover,
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.rounded {
  border-radius: 4px;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>

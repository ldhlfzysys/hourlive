<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import FullCalendar from '@fullcalendar/vue3';
import { Avatar, Button, message, RangePicker, Tooltip } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { CircleHelp, PlusCircle } from 'lucide-vue-next';

import CustomerModal from '#/components/CustomerModal.vue';
import SelectFilter from '#/components/selectfilter.vue';
import StreamerForm from '#/components/streamerform.vue';
import { useRoomStore, useSchedulingStore, useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const schedulingStore = useSchedulingStore();
const streamerStore = useStreamerStore();
const roomStore = useRoomStore();
const calendarRef = ref(null);

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
  schedulingStore.queryTimeslots({
    begin_date: date[0].format('YYYY-MM-DD'),
    finish_date: date[1].format('YYYY-MM-DD'),
  });
}

async function handleSaveTimeslots() {
  if (schedulingStore.changedTimeslots.size === 0) {
    message.warning('没有需要保存的变更');
    return;
  }

  const timeslotSaves = [...schedulingStore.changedTimeslots.values()].map(
    (slot) => ({
      begin_date: slot.begin_date,
      create: slot.create,
      customer_id: slot.customer_id,
      finish_date: slot.finish_date,
      id: slot.create === 1 ? undefined : Number(slot.id),
      room_id: slot.room_id,
      streamer_id: slot.streamer_id,
    }),
  );
  console.log(timeslotSaves);

  await schedulingStore.saveTimeslots(timeslotSaves);
  message.success('保存成功');
}

onMounted(async () => {
  await useStreamerStore().queryStreamer();
  console.log('xxxxx');
  await schedulingStore.queryCustomers();
  await useRoomStore().queryRoom();
  await schedulingStore.initCalendar();

  // 初始化时查询时间段
  schedulingStore.queryTimeslots({
    begin_date: schedulingStore.dateRange[0].format('YYYY-MM-DD'),
    finish_date: schedulingStore.dateRange[1].format('YYYY-MM-DD'),
  });
});
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div class="flex items-center justify-between space-x-4">
          <RangePicker
            v-model:value="schedulingStore.dateRange"
            :ranges="ranges"
            class="w-[300px]"
            @change="handleCalendarChange"
          />

          <div class="flex flex-grow items-center justify-end space-x-4">
            <SelectFilter
              v-model="schedulingStore.selectedCustomerIds"
              :options="schedulingStore.customerOptions"
              placeholder="过滤显示的品牌"
              title="过滤品牌"
            />

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

            <div class="flex items-center">
              <Button
                :disabled="schedulingStore.changedTimeslots.size === 0"
                :loading="schedulingStore.timeslotSaveLoading"
                type="primary"
                @click="handleSaveTimeslots"
              >
                保存排班
              </Button>
              <Tooltip title="将当前编辑的内容保存">
                <CircleHelp
                  class="ml-1 cursor-pointer text-blue-500"
                  size="16"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="relative flex h-full p-2">
          <div class="absolute left-2 h-[calc(100%-16px)] w-[100px]">
            <div class="flex h-full flex-col rounded border bg-white">
              <div class="flex items-center border-b p-2">
                <span class="text-sm text-gray-600">主播列表</span>
                <Tooltip title="选中主播进行排班">
                  <CircleHelp
                    class="ml-2 cursor-pointer text-blue-500"
                    size="16"
                  />
                </Tooltip>
              </div>

              <div class="flex-1 overflow-y-auto p-2">
                <div class="flex flex-col items-center">
                  <Button
                    class="mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-dashed hover:border-blue-500 hover:text-blue-500"
                    type="default"
                    @click="streamerStore.showModal = true"
                  >
                    <PlusCircle class="text-2xl" />
                  </Button>

                  <TransitionGroup
                    class="flex flex-col items-center"
                    name="list"
                    tag="div"
                  >
                    <div
                      v-for="streamer in schedulingStore.streamerList"
                      :key="streamer.id"
                      class="mb-2 flex flex-col items-center"
                    >
                      <div
                        :class="{
                          'bg-blue-100':
                            schedulingStore.selectedStreamId === streamer.id,
                          'hover:bg-gray-100':
                            schedulingStore.selectedStreamId !== streamer.id,
                        }"
                        class="flex cursor-pointer flex-col items-center rounded-lg p-2 transition-all duration-200"
                        @click="
                          schedulingStore.selectedStreamId =
                            schedulingStore.selectedStreamId === streamer.id
                              ? undefined
                              : streamer.id
                        "
                      >
                        <Avatar :size="40" :src="streamer.avatar" />
                        <span
                          class="mt-1 w-full truncate text-center text-xs text-gray-600"
                          >{{ streamer.name }}</span
                        >
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </div>
          </div>

          <div class="ml-[100px] w-[calc(100%-100px)]">
            <div class="absolute left-[112px] right-2 top-2 z-10">
              <div class="rounded border bg-white">
                <div class="flex p-2">
                  <div class="flex flex-col items-center border-r pr-4">
                    <div class="mb-3 flex items-center">
                      <span class="text-sm text-gray-600">品牌列表</span>
                      <Tooltip title="选中品牌进行排班">
                        <CircleHelp
                          class="ml-2 cursor-pointer text-blue-500"
                          size="16"
                        />
                      </Tooltip>
                    </div>

                    <Button
                      class="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center border-2 border-dashed hover:border-blue-500 hover:text-blue-500"
                      type="default"
                      @click="schedulingStore.showAddCustomerModal()"
                    >
                      <PlusCircle class="text-xl" />
                    </Button>
                  </div>

                  <div class="flex-1 overflow-x-auto pl-4">
                    <div class="flex items-center space-x-3">
                      <TransitionGroup
                        class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                        name="list"
                        tag="div"
                      >
                        <div
                          v-for="brand in schedulingStore.brandList"
                          :key="brand.id"
                          class="mb-2 flex flex-col items-center"
                        >
                          <div
                            :class="{
                              'bg-blue-100':
                                schedulingStore.selectedBrandId === brand.id,
                              'hover:bg-gray-100':
                                schedulingStore.selectedBrandId !== brand.id,
                            }"
                            class="flex cursor-pointer flex-col items-center rounded-lg p-2 transition-all duration-200"
                            @click="handleBrandClick(brand.id)"
                          >
                            <img
                              :alt="brand.name"
                              :src="brand.avatar"
                              class="h-[30px] w-[30px] rounded object-cover"
                            />
                            <span
                              class="mt-1 max-w-[60px] truncate text-center text-xs text-gray-600"
                              >{{ brand.name }}</span
                            >
                          </div>
                        </div>
                      </TransitionGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-[100px] h-[calc(100%-100px)] px-2">
              <FullCalendar
                ref="calendarRef"
                :options="{
                  ...schedulingStore.calendarOptions,
                  height: '100%',
                  contentHeight: 'auto',
                }"
                class="overflow-auto"
              />
            </div>
          </div>
        </div>
      </template>
    </HourLivePage>
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
  height: 100% !important;
}

.fc-view-harness {
  height: 100% !important;
}

.fc-scroller {
  height: 100% !important;
  overflow-y: auto !important;
}

/* 确保页面本身不滚动 */
body {
  overflow: hidden;
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

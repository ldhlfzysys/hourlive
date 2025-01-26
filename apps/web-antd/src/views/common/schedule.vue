/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref, watch } from 'vue';
import VueCal from 'vue-cal';

import { AccessControl, useAccess } from '@vben/access';
import { $t, i18n } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import Empty from '#/components/empty.vue';
import OrderApendModal from '#/components/orderApendModal.vue';
import OrderDetailModal from '#/components/orderDetailModal.vue';
import SelectFilter from '#/components/selectfilter.vue';
import TimeslotOrderForm from '#/components/timeslotorderform.vue';
import {
  useAgencyStore,
  useContentStore,
  useCustomerStore,
  useSampleStore,
  useTimeslotOrderStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import 'vue-cal/dist/vuecal.css';
import './css/schedule.css';

const { hasAccessByRoles } = useAccess();

interface Event {
  id: number;
  slotId: number;
  start: string; // Required.
  end: string; // Required.
  title?: string; // Optional.
  content?: string; // Optional.
  class?: string; // Optional - space-separated css classes.
  background?: boolean; // Optional. (Event type not CSS property)
  split?: number | string; // Optional.
  allDay?: boolean; // Optional.
  key?: string; // Optional.
  draggable?: boolean; // Optional.
  deletable?: boolean; // optional - force undeletable when events are editable.
  resizable?: boolean; // optional - force unresizable when events are editable.
}

// Data
const orderStore = useTimeslotOrderStore();
const agencyStore = useAgencyStore();
const userStore = useUserStore();
const customerStore = useCustomerStore();
const sampleStore = useSampleStore();
const contentStore = useContentStore();
const selectDate = dayjs();

const events = computed(() => {
  const allEvents: Event[] = [];
  orderStore.timeslotOrderList.forEach((order: TimeslotOrder) => {
    order.timeslots.forEach((timeslot) => {
      const slotContent = order.contents
        .map((content) => {
          let rst: string = content.id.toString();
          if (content.liveaccount) {
            rst += `-${content.liveaccount!.name}-${
              content.liveaccount!.live_account
            }`;
          }
          return rst;
        })
        .join(',');

      const agencyName = order.agency?.name;
      const overday = timeslot.end_date !== timeslot.date;

      const startTimeStr = timeslot.begin_date.replace('T', ' ');
      const endTimeStr = overday
        ? dayjs(startTimeStr).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : timeslot.finish_date.replace('T', ' ');
      const isPast = dayjs(endTimeStr).isBefore(dayjs());

      const startTime = overday
        ? dayjs(`${timeslot.date} ${timeslot.start_time}`).format('MM/DD HH:mm')
        : timeslot.start_time;
      const endTime = overday
        ? dayjs(`${timeslot.end_date} ${timeslot.end_time}`).format(
            'MM/DD HH:mm',
          )
        : timeslot.end_time;

      const eventClass = orderStore.getEventClass(order.id, isPast);

      let content = '';

      if (hasAccessByRoles(['customer'])) {
        content = `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
          </div>
        `;
      } else if (hasAccessByRoles(['agency'])) {
        content = `
         <div class="event-content">
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `;
      } else {
        // 选中了一个机构，则隐藏机构
        if (selectedAgencies.value.length === 1) {
          content = `
         <div class="event-content">
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `;
        } else if (selectedCustomers.value.length === 1) {
          content = `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
          </div>
        `;
        } else {
          content = `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `;
        }
      }

      allEvents.push({
        background: true,
        class: eventClass,
        content,
        deletable: false,
        draggable: false,
        end: endTimeStr,
        id: order.id,
        resizable: false,
        slotId: timeslot.id,
        start: startTimeStr,
        title: `
          <div class="event-container">
            <div class="flex justify-between items-center text-sm" >
              <span style="font-size: 12px;font-weight: 500;text-align: left;">
                ${startTime}-${endTime}
                ${overday ? '<span style="color: red;border: 1px solid red;border-radius: 4px;padding: 1px;font-size: 10px;">跨日</span>' : ''}
              </span>
              <span style="font-size: 11px;margin-right: 10px;">ID:${order.id}</span>
            </div>
          </div>
        `,
      });
    });
  });

  return allEvents.sort((a, b) => {
    return dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1;
  });
});
const activeView = ref('month');
const selectedAgencies = ref([]);
const selectedCustomers = ref([]);
const selectedContents = ref([]);
const selectedRooms = ref([]);

watch(
  [selectedAgencies, selectedCustomers, selectedContents, selectedRooms],
  () => {
    const filters: { key: string; value: number[] }[] = [];
    if (selectedAgencies.value.length > 0) {
      filters.push({ key: 'agency', value: selectedAgencies.value });
    }
    if (selectedCustomers.value.length > 0) {
      filters.push({ key: 'customer', value: selectedCustomers.value });
    }
    if (selectedContents.value.length > 0) {
      filters.push({ key: 'content', value: selectedContents.value });
    }
    if (selectedRooms.value.length > 0) {
      filters.push({ key: 'room', value: selectedRooms.value });
    }
    orderStore.orderFilters = filters;
  },
);

// Function
const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

// Life Time
onMounted(() => {
  console.log('onmouted !!!!!');
  orderStore.$reset();
  // 设置初始月份的查询范围
  const currentDate = dayjs();
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');

  orderStore.timeslotOrderQuery = {
    ...orderStore.timeslotOrderQuery,
    begin_date: startOfMonth.format('YYYY-MM-DD'),
    finish_date: endOfMonth.format('YYYY-MM-DD'),
  };

  useAgencyStore().fetchAgency();
  fetchCustomerData();
  useTimeslotOrderStore().queryTimeslotOrder();
});

function fetchCustomerData() {
  if (hasAccessByRoles(['super'])) {
    useCustomerStore().fetchAllCustomers();
  } else if (hasAccessByRoles(['agency'])) {
    useCustomerStore().getAgencyCustomers();
  }
}

function handleCreateOrder() {
  orderStore.isEditing = true;
  orderStore.formState = {
    enableEdit: true,
    formType: 'add',
    timeslots: [],
  };
}

// CalendarEvent
function handleEventChange(event: any) {
  if (hasAccessByRoles(['super'])) {
    let actualEvent = event;
    if (Object.hasOwn(actualEvent, 'event')) {
      actualEvent = actualEvent.event;
    }

    const startTime = dayjs(actualEvent.start);
    const endTime = dayjs(actualEvent.end);
    orderStore.isEditing = true;
    const initTimeModel: TimeslotModel = {
      canEdit: true,
      date: startTime,
      slot: [startTime, endTime],
    };
    orderStore.formState = {
      enableEdit: true,
      formType: 'add',
      liveTime: [startTime, endTime],
      timeslot: [startTime, endTime],
      timeslots: [initTimeModel],
    };
  }
}

function handleCellClick(event: any) {
  if (activeView.value === 'month') {
    activeView.value = 'day';
  }
}

function handleEventClick(event: Event, e: MouseEvent) {
  const order = orderStore.orderById(event.id);
  if (order) {
    orderStore.setCurrentSelectedOrder(event.id);
    orderStore.isEditing = false;
    orderStore.currentSelectedOrder!.end = dayjs(event.end).format(
      'MM/DD HH:mm',
    );
    orderStore.currentSelectedOrder!.start = dayjs(event.start).format(
      'MM/DD HH:mm',
    );
    orderStore.currentSelectedOrder!.slotId = event.slotId;
    orderStore.showEventDetails = true;
  }
}

function handleApendOrder() {
  orderStore.isEditing = false;
  orderStore.showApendModal = true;
}

// 添加新的函数处理月份变化
function handleViewChange({ endDate, startDate }) {
  // const currentStartDate = dayjs(orderStore.timeslotOrderQuery.begin_date);
  // const currentEndDate = dayjs(orderStore.timeslotOrderQuery.finish_date);

  // if (
  //   (dayjs(startDate).isAfter(currentStartDate) ||
  //     dayjs(startDate).isSame(currentStartDate)) &&
  //   (dayjs(endDate).isBefore(currentEndDate) ||
  //     dayjs(endDate).isSame(currentEndDate))
  // ) {
  //   return;
  // }

  // 设置查询时间范围
  orderStore.timeslotOrderQuery = {
    ...orderStore.timeslotOrderQuery,
    begin_date: dayjs(startDate).subtract(1, 'month').format('YYYY-MM-DD'),
    finish_date: dayjs(endDate).add(1, 'month').format('YYYY-MM-DD'),
  };
  // 重新请求数据
  orderStore.queryTimeslotOrder();
}
</script>

<template>
  <div>
    <link href="./css/schedule.css" rel="stylesheet" />
    <HourLivePage :content-overflow="true">
      <template #header>
        <div class="flex w-[full] flex-wrap">
          <AccessControl :codes="['super', 'customer']">
            <SelectFilter
              v-model="selectedAgencies"
              :options="agencyStore.agencyOptions"
              :placeholder="$t('selectagency')"
              :title="$t('agency')"
            />
          </AccessControl>
          <AccessControl :codes="['super', 'agency']">
            <SelectFilter
              v-model="selectedRooms"
              :options="agencyStore.roomOptionsByAgencyIds(selectedAgencies)"
              :placeholder="$t('selectroom')"
              :title="$t('room')"
            />
            <SelectFilter
              v-model="selectedCustomers"
              :options="customerStore.customerOptions ?? []"
              :placeholder="$t('selectcustomer')"
              :title="$t('hourlive_account')"
            />
            <SelectFilter
              v-model="selectedContents"
              :options="customerStore.contentOptions ?? []"
              :placeholder="$t('selectcontent')"
              :title="$t('content')"
            />
          </AccessControl>

          <AccessControl :codes="['super']">
            <div class="flex items-center space-x-2">
              <Button
                v-if="!orderStore.isEditing"
                ghost
                type="primary"
                @click="handleCreateOrder"
              >
                新增订单
              </Button>
              <!-- <Button type="primary" @click="handleDownload">
                {{ $t('download') }}
              </Button> -->
            </div>
          </AccessControl>
        </div>
      </template>

      <template #content>
        <div class="flex h-full flex-1 flex-row space-x-4">
          <div
            v-if="orderStore.timeslotOrderList.length > 0"
            class="relative flex h-full flex-1 flex-col"
          >
            <div
              v-if="orderStore.timeslotOrderLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-white/60"
            >
              <div class="loading-spinner"></div>
            </div>
            <VueCal
              v-model:active-view="activeView"
              :disable-views="['years', 'year']"
              :editable-events="{
                title: false,
                drag: false,
                resize: true,
                delete: true,
                create: true,
              }"
              :events="events"
              :events-on-month-view="true"
              :loading="orderStore.timeslotOrderLoading"
              :locale="localeStr"
              :selected-date="selectDate.format('YYYY-MM-DD')"
              :snap-to-time="15"
              :time-from="0"
              :time-step="120"
              :time-to="24 * 60"
              class="vuecal--full-height-delete"
              watch-real-time
              @cell-click="handleCellClick"
              @event-click="handleEventClick"
              @event-drag-create="handleEventChange"
              @event-duration-change="handleEventChange"
              @view-change="handleViewChange"
            />
          </div>

          <Empty
            v-else
            :loading="orderStore.timeslotOrderLoading"
            class="flex-1"
            description="暂无订单信息"
          />

          <div v-if="orderStore.isEditing" class="flex h-full w-[40%] flex-col">
            <div class="mb-2 flex items-center justify-between">
              <button
                class="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
                @click="orderStore.isEditing = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>

              <div class="flex space-x-2">
                <!-- <Button type="primary" @click="handleApendOrder">
                  {{ $t('apendorder') }}
                </Button> -->
                <Button
                  :disabled="!orderStore.enableOrder"
                  type="primary"
                  @click="orderStore.makeOrders"
                >
                  {{ $t('makeorder') }}
                </Button>
              </div>
            </div>
            <TimeslotOrderForm v-if="orderStore.isEditing" />
          </div>
        </div>
        <OrderApendModal v-if="orderStore.showApendModal" />
      </template>

      <template #footer></template>
    </HourLivePage>

    <OrderDetailModal v-if="orderStore.showEventDetails" />
  </div>
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

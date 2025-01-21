/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref, watch } from 'vue';

import { AccessControl, useAccess } from '@vben/access';
import { $t, i18n } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { DatePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

import Empty from '#/components/empty.vue';
import OrderDetailCard from '#/components/orderdetailcard.vue';
import SelectFilter from '#/components/selectfilter.vue';
import {
  useAgencyStore,
  useContentStore,
  useCustomerStore,
  useSampleStore,
  useTimeslotOrderStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
const selectedMonth = ref(dayjs());

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

      const startTimeStr = timeslot.begin_date.replace('T', ' ');
      const endTimeStr = timeslot.finish_date.replace('T', ' ');
      const isPast = dayjs(endTimeStr).isBefore(dayjs());

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
              <span style="font-size: 12px;margin-left: 10px;font-weight: 500;">${timeslot.start_time}-${timeslot.end_time}</span>
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

// 添加处理月份变化的函数
function handleMonthChange(date: dayjs.Dayjs) {
  if (!date) return;

  selectedMonth.value = date;
  const startOfMonth = date.startOf('month');
  const endOfMonth = date.endOf('month');

  // 清空现有数据
  orderStore.$reset();

  // 设置查询时间范围
  orderStore.timeslotOrderQuery = {
    ...orderStore.timeslotOrderQuery,
    begin_date: startOfMonth.format('YYYY-MM-DD'),
    finish_date: endOfMonth.format('YYYY-MM-DD'),
  };

  // 重新请求数据
  orderStore.queryTimeslotOrder();
}
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div class="flex w-[full] flex-wrap">
          <div class="mr-4">
            <DatePicker
              v-model:value="selectedMonth"
              :placeholder="$t('selectmonth')"
              format="YYYY-MM"
              picker="month"
              @change="handleMonthChange"
            />
          </div>
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
        </div>
      </template>

      <template #content>
        <div class="p-4">
          <div v-if="orderStore.timeslotOrderList.length > 0" class="space-y-4">
            <OrderDetailCard
              v-for="order in orderStore.timeslotOrderList.filter(
                (order) => order.timeslots.length > 0,
              )"
              :key="order.id"
              :timeslot-order="order"
            />
          </div>
          <Empty
            v-else
            :loading="orderStore.timeslotOrderLoading"
            description="暂无订单信息"
          />
        </div>
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

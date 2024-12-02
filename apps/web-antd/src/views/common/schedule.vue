/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { SlotEvent, TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref, watch } from 'vue';
import VueCal from 'vue-cal';

import { AccessControl, useAccess } from '@vben/access';
import { $t, i18n } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import Empty from '#/components/empty.vue';
import OrderApendModal from '#/components/orderApendModal.vue';
import OrderDetailModal from '#/components/orderDeatailModal.vue';
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

      const agencyName = agencyStore.agencyById(order.agency_id)?.name;

      const eventClass = orderStore.getEventClass(order.id);

      let content = '';
      content =
        selectedAgencies.value.length === 1
          ? `
         <div class="event-content">
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `
          : `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `;

      allEvents.push({
        background: true,
        class: eventClass,
        content,
        deletable: false,
        draggable: false,
        end: `${timeslot.date} ${timeslot.end_time}`,
        id: order.id,
        resizable: false,
        slotId: timeslot.id,
        start: `${timeslot.date} ${timeslot.start_time}`,
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
const selectedEvent = ref<null | SlotEvent>(null);

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

  console.log(orderStore.formState);
}

function handleCellClick(event: any) {
  if (activeView.value === 'month') {
    activeView.value = 'day';
  }
}

function handleEventClick(event: Event, e: MouseEvent) {
  const order = orderStore.orderById(event.id);

  if (order) {
    sampleStore.clearSamples();
    orderStore.isEditing = false;
    sampleStore.sampleQuery.content_ids = order.contents.map(
      (content) => content.id,
    );
    sampleStore.sampleQuery.q_size = 100;
    sampleStore.querySample();
    selectedEvent.value = {
      ...order,
      end: dayjs(event.end).format('MM/DD HH:mm'),
      slotId: event.slotId,
      start: dayjs(event.start).format('MM/DD HH:mm'),
    };
    orderStore.showEventDetails = true;
  }
}

function disablePastDates(date: Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

function handleApendOrder() {
  orderStore.isEditing = false;
  orderStore.showApendModal = true;
}
</script>

<template>
  <div>
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
        </div>
      </template>

      <template #content>
        <div class="flex h-full flex-1 flex-row space-x-4">
          <div
            v-if="orderStore.timeslotOrderList.length > 0"
            class="flex h-full flex-1 flex-col"
          >
            <VueCal
              v-model:active-view="activeView"
              :disable-dates="disablePastDates"
              :disable-views="['years', 'year']"
              :drag-to-create-threshold="0"
              :editable-events="{
                title: false,
                drag: false,
                resize: true,
                delete: true,
                create: true,
              }"
              :events="events"
              :events-on-month-view="true"
              :locale="localeStr"
              :selected-date="dayjs().format('YYYY-MM-DD')"
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
                <Button type="primary" @click="handleApendOrder">
                  {{ $t('apendorder') }}
                </Button>
                <Button type="primary" @click="orderStore.makeOrders">
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

    <div v-if="selectedEvent">
      <OrderDetailModal
        v-if="orderStore.showEventDetails"
        :event="selectedEvent"
      />
    </div>
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

:deep(.event-container) {
  height: 100%;
  border-radius: 1px;
}

:deep(.event-content) {
  padding: 4px 10px;
  font-size: 12px;
  text-align: left;
  word-break: break-all;
}

:deep(.vuecal__cell--disabled) {
  color: #a0a0a0 !important; /* Gray text */
  pointer-events: none; /* Disable click events */
  background-color: #f0f0f0 !important; /* Light gray background */
}

:deep(.vuecal__event) {
  max-width: 500px !important;
  overflow: hidden;
  background-color: rgb(46 139 168 / 60%);
  border: 1px solid #e5e7eb !important;
  border-radius: 4px;
}

:deep(.color-event-0) {
  background-color: #fde6e0;
}

:deep(.color-event-1) {
  background-color: #c7edcc;
}

:deep(.color-event-2) {
  background-color: #faf9de;
}

:deep(.color-event-3) {
  background-color: #dce2f1;
}

:deep(.color-event-4) {
  background-color: #c7edcc;
}

:deep(.color-event-5) {
  background-color: #fff2e2;
}

:deep(.color-event-6) {
  background-color: #e0ffff;
}

:deep(.color-event-7) {
  background-color: #f0e68c;
}

:deep(.color-event-8) {
  background-color: #afeeee;
}

:deep(.color-event-9) {
  background-color: #88ada6;
}

:deep(.color-event-10) {
  background-color: #a1afc9;
}

:deep(.color-event-11) {
  background-color: #e4c6d0;
}

:deep(.color-event-12) {
  background-color: #eedeb0;
}

:deep(.color-event-13) {
  background-color: #fcefe8;
}

:deep(.color-event-14) {
  background-color: #d6ecf0;
}

:deep(.color-event-15) {
  background-color: #e9e7ef;
}

:deep(.color-event-16) {
  background-color: #eacd76;
}

:deep(.color-event-17) {
  background-color: #f4a460;
}

:deep(.color-event-18) {
  background-color: #d3d3d3;
}

:deep(.color-event-19) {
  background-color: #d1c4ca;
}

:deep(.color-event-20) {
  background-color: #cbb1ab;
}

:deep(.color-event-21) {
  background-color: #b7d2be;
}

:deep(.color-event-22) {
  background-color: #e7dfec;
}

:deep(.color-event-23) {
  background-color: #eee791;
}

:deep(.color-event-24) {
  background-color: #e0ffff;
}

:deep(.color-event-25) {
  background-color: #cc9;
}

:deep(.color-event-26) {
  background-color: #39c;
}

:deep(.color-event-27) {
  background-color: #f9c;
}

:deep(.color-event-28) {
  background-color: #fc9;
}

:deep(.vuecal__event[class*='color-event-'] .vuecal__event-time) {
  display: none;
}
</style>

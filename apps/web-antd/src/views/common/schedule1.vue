/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref } from 'vue';
import VueCal from 'vue-cal';

import { $t, i18n } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button, Descriptions, DescriptionsItem, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import SelectFilter from '#/components/selectfilter.vue';
import TimeslotOrderForm from '#/components/timeslotorderform.vue';
import {
  useAgencyStore,
  useContentStore,
  useCustomerStore,
  useTimeslotOrderStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-cal/dist/vuecal.css';

interface Event {
  id: number;
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
const contentStore = useContentStore();
const isSuper = computed(() => {
  return userStore.userRoles.includes('super');
});

const isAgency = computed(() => {
  return userStore.userRoles.includes('agency');
});

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

      allEvents.push({
        background: true,
        content: `
         <div class="event-content">
            <div>${$t('agency')}:${agencyName}</div>
            <div>${$t('customer')}:${order.customer?.code}</div>
          </div>
        `,
        deletable: false,
        draggable: false,
        end: `${timeslot.date} ${timeslot.end_time}`,
        id: order.id,
        resizable: false,
        start: `${timeslot.date} ${timeslot.start_time}`,
        title: `
          <div class="event-container">
            <div class="flex justify-between items-center text-sm">
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
const selectedDate = ref('');
const loading = ref(false);
const activeView = ref('month');
const selectedAgencies = ref([]);
const selectedCustomers = ref([]);
const selectedContents = ref([]);
const selectedRooms = ref([]);
const showEventDetails = ref(false);
const selectedEvent = ref<null | TimeslotOrder>(null);

// Function
const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

const availableFilters = computed(() => {
  if (isSuper.value) {
    return ['agency', 'room', 'customer', 'content'];
  } else if (isAgency.value) {
    return ['room', 'customer', 'content'];
  }
  return [];
});

// Life Time
onMounted(() => {
  useAgencyStore().fetchAgency();
  fetchCustomerData();
  useTimeslotOrderStore().queryTimeslotOrder();
});

function fetchCustomerData() {
  if (isSuper.value) {
    useCustomerStore().fetchAllCustomers();
  } else if (isAgency.value) {
    useCustomerStore().getAgencyCustomers();
  }
}

// CalendarEvent
function handleCellClick(event: any) {
  selectedDate.value = event.format('YYYY-MM-DD HH:00');
  const startTime = dayjs(event.format('YYYY-MM-DD HH:00'));
  const endTime = startTime.add(2, 'hour');
  if (activeView.value === 'month') {
    activeView.value = 'day';
  } else {
    if (isSuper.value) {
      orderStore.isEditing = true;
      const initTiMeModel: TimeslotModel = {
        canEdit: true,
        date: startTime.clone(),
        slot: [startTime.clone(), endTime.clone()],
      };
      orderStore.formState = {
        enableEdit: true,
        liveTime: [dayjs(selectedDate.value), dayjs(selectedDate.value)],
        timeslot: [startTime, endTime],
        timeslots: [initTiMeModel],
      };
    }
  }
}

function handleEventClick(event: Event, e: MouseEvent) {
  console.log(event);
  const order = orderStore.orderById(event.id);

  if (order) {
    selectedEvent.value = order;
    showEventDetails.value = true;
  }
}

function handleDeleteOrder() {
  // orderStore.deleteOrders(slot);
}
</script>

<template>
  <div>
    <HourLivePage :content-overflow="true">
      <template #header>
        <div v-for="filter in availableFilters" :key="filter">
          <SelectFilter
            v-if="filter === 'agency'"
            v-model="selectedAgencies"
            :options="agencyStore.agencyOptions"
            :placeholder="$t('selectagency')"
            :title="$t('agency')"
          />
          <SelectFilter
            v-if="filter === 'room'"
            v-model="selectedRooms"
            :options="agencyStore.roomOptionsByAgencyIds(selectedAgencies)"
            :placeholder="$t('selectroom')"
            :title="$t('room')"
          />
          <SelectFilter
            v-if="filter === 'customer'"
            v-model="selectedCustomers"
            :options="customerStore.customerOptions ?? []"
            :placeholder="$t('selectcustomer')"
            :title="$t('hourlive_account')"
          />
          <SelectFilter
            v-if="filter === 'content'"
            v-model="selectedContents"
            :options="customerStore.contentOptions ?? []"
            :placeholder="$t('selectcontent')"
            :title="$t('content')"
          />
        </div>
      </template>

      <template #content>
        <div class="flex h-full flex-1 flex-row space-x-4">
          <div class="flex h-full flex-1 flex-col">
            <VueCal
              v-model:active-view="activeView"
              :disable-views="['years', 'year']"
              :drag-to-create-event="false"
              :events="events"
              :events-on-month-view="true"
              :locale="localeStr"
              :selected-date="dayjs().format('YYYY-MM-DD')"
              :time-from="0"
              :time-step="120"
              :time-to="24 * 60"
              watch-real-time
              @cell-click="handleCellClick"
              @event-click="handleEventClick"
            >
              <!-- <template #event="{ event, view }">
        
        
                <small class="vuecal__event-time" style="display: none;">
                </small>
                <div class="vuecal__event-content" v-html="event.content"/>
              </template> -->
            </VueCal>
          </div>

          <div
            v-if="orderStore.isEditing"
            class="flex h-full w-[500px] flex-col"
          >
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
              <Button type="primary" @click="orderStore.makeOrders">
                {{ $t('makeorder') }}
              </Button>
            </div>
            <TimeslotOrderForm />
          </div>
        </div>
      </template>

      <template #footer></template>
    </HourLivePage>

    <div v-if="selectedEvent">
      <Modal
        v-model:open="showEventDetails"
        :title="$t('orderdetail')"
        style="width: 800px; max-height: 500px; overflow-y: auto"
        @cancel="showEventDetails = false"
      >
        <Descriptions :column="3" bordered>
          <DescriptionsItem :label="$t('id')">
            {{ selectedEvent!.id }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('agency')">
            {{ agencyStore.agencyById(selectedEvent!.agency_id)?.name }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('customer')">
            {{ selectedEvent!.customer?.code }}
          </DescriptionsItem>

          <DescriptionsItem :label="$t('content')" :span="3">
            {{ selectedEvent!.contents.map((c) => c.id).join(',') }}
          </DescriptionsItem>
        </Descriptions>

        <template #footer>
          <!-- <a-button key="back" @click="handleCancel">Return</a-button> -->
          <Button
            v-if="isSuper"
            key="submit"
            :loading="loading"
            type="primary"
            @click="handleDeleteOrder"
          >
            {{ $t('delete') }}
          </Button>
        </template>
      </Modal>
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

:deep(.vuecal__event) {
  overflow: hidden;
  border: 1px solid #e5e7eb !important;
  border-radius: 4px;
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

:deep(.vuecal__event-time) {
  display: none;
}
</style>

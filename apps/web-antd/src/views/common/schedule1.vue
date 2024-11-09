/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { TimeslotOrder } from '#/types';

import { computed, onMounted, ref } from 'vue';
import VueCal from 'vue-cal';

import { $t, i18n } from '@vben/locales';

import dayjs from 'dayjs';

import SelectFilter from '#/components/selectfilter.vue';
import TimeslotOrderForm from '#/components/timeslotorderform.vue';
import { useAgencyStore, useTimeslotOrderStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-cal/dist/vuecal.css';

interface Event {
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
const editing = ref(false);
const activeView = ref('month');
const selectedAgencies = ref([]);

// Function
const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

// Life Time
onMounted(() => {
  useAgencyStore().fetchAgency();
  useTimeslotOrderStore().queryTimeslotOrder();
});

// CalendarEvent
function handleCellClick(event: any) {
  selectedDate.value = event.format('YYYY-MM-DD HH:00');
  if (activeView.value === 'month') {
    activeView.value = 'day';
  } else {
    editing.value = true;
    orderStore.formState = {
      enableEdit: true,
    };
  }
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div class="w-[40px]">
        <SelectFilter
          v-model="selectedAgencies"
          :options="agencyStore.agencyOptions"
          placeholder="请选择机构"
          title="机构"
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
          >
            <!-- <template #event="{ event, view }">
        
        
            <small class="vuecal__event-time" style="display: none;">
            </small>
            <div class="vuecal__event-content" v-html="event.content"/>
          </template> -->
          </VueCal>
        </div>

        <div v-if="editing" class="flex h-full w-[500px] flex-col">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ $t('makeorder') }}</h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
              @click="editing = false"
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
          </div>
          <TimeslotOrderForm />
        </div>
      </div>
    </template>

    <template #footer></template>
  </HourLivePage>
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

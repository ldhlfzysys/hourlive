/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import type { OrderQuery, TimeslotOrder } from '#/types';

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
  orderStore.filterOrders().forEach((order: TimeslotOrder) => {
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

      const content = `
      ${$t('timeslotorder_id')}:${order.id}<br>
      ${$t('room_id')}:${order.room_id}<br>
      ${$t('content')}:${slotContent}<br>
      `;
      allEvents.push({
        background: true,
        class: 'sport',
        content,
        deletable: false,
        draggable: false,
        end: `${timeslot.date} ${timeslot.end_time}`,
        resizable: false,
        start: `${timeslot.date} ${timeslot.start_time}`,
      });
    });
  });
  return allEvents;
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
  const query: OrderQuery = {
    agency_id: -1,
  };
  useTimeslotOrderStore().fetchOrders(query);
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
            :locale="localeStr"
            :selected-date="dayjs().format('YYYY-MM-DD')"
            :time-from="0"
            :time-step="120"
            :time-to="24 * 60"
            events-on-month-view="true"
            watch-real-time
            @cell-click="handleCellClick"
          />
        </div>

        <div v-if="editing" class="flex h-full w-[500px] flex-col">
          <h2 class="mb-2 text-xl font-semibold">{{ $t('makeorder') }}</h2>
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
</style>

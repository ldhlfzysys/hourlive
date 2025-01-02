<script lang="ts" setup>
import type { Event, TimeslotModel } from '#/types';

import { computed, ref } from 'vue';
import VueCal from 'vue-cal';

import { i18n } from '@vben/locales';

import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useHourLivePackageStore, useTimeslotOrderStore } from '#/store';

import 'vue-cal/dist/vuecal.css';
import '#/views/common/css/schedule.css';

defineOptions({
  name: 'SingleDateModal',
});

const hourLivePackageStore = useHourLivePackageStore();
const timeslotOrderStore = useTimeslotOrderStore();

const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

const selectDate = computed(() => {
  const date = hourLivePackageStore.currentSlotsMap.keys().next().value;
  return dayjs(date);
});

const timeslots = computed(() => {
  return hourLivePackageStore.currentSlotsMap.values().next().value;
});

const vueCalRef = ref(null);
const events = computed(() => {
  const allEvents: Event[] = [];

  timeslots.value.forEach((timeslot) => {
    const startTimeStr = `${timeslot.date} ${timeslot.start_time}`;
    const endTimeStr = `${timeslot.date} ${timeslot.end_time}`;
    const isPast = dayjs(endTimeStr).isBefore(dayjs());
    const eventClass = timeslot.is_create
      ? 'vuecal__event'
      : timeslotOrderStore.getEventClass(timeslot.id, isPast);

    allEvents.push({
      background: true,
      class: eventClass,
      content: '',
      deletable: timeslot.is_create,
      draggable: timeslot.is_create,
      end: endTimeStr,
      id: timeslot.id,
      key: timeslot.key,
      resizable: timeslot.is_create,
      slotId: timeslot.id,
      start: startTimeStr,
    });
  });
  return allEvents.sort((a, b) => {
    return dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1;
  });
});

const modifyMap = ref<Map<string, Event>>(new Map());
const deleteMap = ref<Map<string, Event>>(new Map());

function handleSave() {
  modifyMap.value.forEach((event) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      event.key.startsWith('N-')
    ) {
      const index: number = Number.parseInt(event.key.split('-')[1]);
      const timeslot = hourLivePackageStore.formState.timeslots![index];
      if (timeslot) {
        timeslot.slot = [dayjs(event.start), dayjs(event.end)];
        hourLivePackageStore.formState.timeslots![index] = timeslot;
      }
    } else {
      //       export interface TimeslotModel {
      //   id?: number;
      //   date: [Dayjs, Dayjs] | Dayjs;
      //   slot: [Dayjs, Dayjs] | undefined;
      //   streamerId?: number;
      //   canEdit: boolean;
      //   is_conflict?: boolean;
      // }
      const newTimeslot: TimeslotModel = {
        canEdit: true,
        date: event.start.format('YYYY-MM-DD'),
        slot: [dayjs(event.start), dayjs(event.end)],
        streamerId: hourLivePackageStore.formState.streamerId,
      };
      hourLivePackageStore.formState.timeslots.push(newTimeslot);
    }
  });
  deleteMap.value.forEach((index) => {
    hourLivePackageStore.formState.timeslots.splice(index, 1);
  });
  hourLivePackageStore.showAvailableTimeslotsModal = false;
  hourLivePackageStore.queryTimeslots();
}

function handleEventDelete(event: Event) {
  const eid = event._eid;
  modifyMap.value.delete(eid);
  if (
    Object.prototype.hasOwnProperty.call(event, 'key') &&
    event.key.startsWith('N-')
  ) {
    const index = event.key.split('-')[1];
    deleteMap.value.set(eid, index);
  }
}

function handleEventChange(event: Event) {
  const newEvent = Object.prototype.hasOwnProperty.call(event, 'event')
    ? event.event
    : event;
  const eid = newEvent._eid;
  modifyMap.value.set(eid, newEvent);
}
</script>

<template>
  <div>
    <Modal
      v-model:open="hourLivePackageStore.showAvailableTimeslotsModal"
      style="top: 5%"
      title="选择时间"
      @ok="handleSave"
    >
      <VueCal
        :disable-views="['years', 'year', 'month', 'week']"
        :drag-to-create-threshold="0"
        :editable-events="{
          title: false,
          drag: true,
          resize: true,
          delete: true,
          create: true,
        }"
        :events="events"
        :locale="localeStr"
        :selected-date="selectDate.format('YYYY-MM-DD')"
        :snap-to-time="15"
        :time-from="0"
        :time-step="15"
        :time-to="24 * 60"
        active-view="day"
        class="vuecal--full-height-delete vuecal--blue-theme"
        format="HH:mm"
        hide-title-bar
        hide-view-selector
        small
        watch-real-time
        @event-delete="handleEventDelete"
        @event-drag-create="handleEventChange"
        @event-duration-change="handleEventChange"
      />
    </Modal>
  </div>
</template>
<style scoped>
/* Hide the navigation buttons */
.vuecal__nav {
  display: none;
}
</style>

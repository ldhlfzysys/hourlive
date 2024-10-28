/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import {
  createCalendar,
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import { ScheduleXCalendar } from '@schedule-x/vue';
import dayjs from 'dayjs';

import HourLivePage from '#/views/template/common.vue';

import '@schedule-x/theme-default/dist/index.css';

const calendarApp = createCalendar({
  events: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
});
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div>
        <!-- <LabelFilter
          title="名称2222"
        />
        <SelectFilter
          placeholder="请选择选项"
          title="名称222222222"
        /> -->
      </div>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <ScheduleXCalendar :calendar-app="calendarApp" />
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

/* eslint-disable n/no-extraneous-import */
<script lang="ts" setup>
import { computed, ref } from 'vue';
import VueCal from 'vue-cal';

import { i18n } from '@vben/locales';

import dayjs from 'dayjs';

import HourLivePage from '#/views/template/common.vue';

import 'vue-cal/dist/vuecal.css';

const events = ref([]);
const selectedDate = ref('');
const editing = ref(false);

const localeStr = computed(() => {
  return i18n.global.locale.value.toLowerCase();
});

const activeView = ref('month');

// CalendarEvent
function handleCellClick(event: any) {
  selectedDate.value = event.format('YYYY-MM-DD');
  console.log(event);
  console.log(selectedDate.value);
  if (activeView.value === 'month') {
    activeView.value = 'day';
  } else {
    editing.value = true;
  }
}
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
            :time-to="24 * 60"
            events-on-month-view="true"
            twelve-hour
            watch-real-time
            @cell-click="handleCellClick"
          />
        </div>

        <div v-if="editing" class="flex h-full w-[300px] flex-col">
          <h2 class="mb-2 text-xl font-semibold">选中的日期</h2>
          <p class="text-lg">{{ selectedDate }}</p>
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

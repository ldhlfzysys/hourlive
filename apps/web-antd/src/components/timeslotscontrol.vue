<script lang="ts" setup>
import { computed, ref } from 'vue';

import {
  Divider,
  List,
  ListItem,
  RangePicker,
  Tag,
  TimePicker,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import { Calendar as VCalendar } from 'v-calendar';

import { useTimeslotOrderStore } from '#/store';

import 'v-calendar/style.css';

defineOptions({
  name: 'TimeslotsControl',
});

const orderStore = useTimeslotOrderStore();

const format = 'HH:mm';

const batchSlots = ref<{ end: dayjs.Dayjs; start: dayjs.Dayjs }>({
  end: dayjs().endOf('day'),
  start: dayjs().startOf('day'),
});

const batchAddTimeslot = ref(false);
const attributes = computed(() => {
  return orderStore.formState.timeslots!.map((timeslot) => ({
    dates: { end: timeslot.date, start: timeslot.date },
    highlight: true,
    key: timeslot.date.toISOString(),
  }));
});
function addTimeslot() {
  if (orderStore.formState.timeslots!.length === 0) {
    return;
  }
  const lastTimeslot =
    orderStore.formState.timeslots![orderStore.formState.timeslots!.length - 1];
  const newSlot = [
    lastTimeslot!.slot![0].add(1, 'day'),
    lastTimeslot!.slot![1].add(1, 'day'),
  ];
  orderStore.formState.timeslots!.push({
    canEdit: true,
    date: lastTimeslot!.date.add(1, 'day'),
    slot: newSlot,
  });
}

function deleteTimeslot(index: number) {
  orderStore.formState.timeslots!.splice(index, 1);
}
function handleDateClick(day: any) {
  const date = dayjs(day.date);
  const index = orderStore.formState.timeslots!.findIndex((timeslot) =>
    timeslot.date.isSame(date, 'day'),
  );

  if (index === -1) {
    // If the date does not exist, add a new timeslot
    const startSlot = dayjs(
      `${date.format('YYYY-MM-DD')} ${batchSlots.value.start.format(format)}`,
    );

    const endDate = showOverDay.value
      ? date.add(1, 'day').format('YYYY-MM-DD')
      : date.format('YYYY-MM-DD');
    const endSlot = dayjs(`${endDate} ${batchSlots.value.end.format(format)}`);

    orderStore.formState.timeslots!.push({
      canEdit: true,
      date,
      slot: [startSlot, endSlot],
    });
  } else {
    // If the date exists, remove the timeslot
    orderStore.formState.timeslots!.splice(index, 1);
  }
}

function handleBatchAddTimeslot() {
  batchAddTimeslot.value = true;
  const lastTimeslot =
    orderStore.formState.timeslots![orderStore.formState.timeslots!.length - 1];
  batchSlots.value = {
    end: lastTimeslot!.slot![1],
    start: lastTimeslot!.slot![0],
  };
}

const showOverDay = computed(() => {
  return batchSlots.value.start.isAfter(batchSlots.value.end);
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-if="!batchAddTimeslot"
      class="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-blue-500"
      @click="handleBatchAddTimeslot"
    >
      <div
        class="flex h-full w-full items-center justify-center gap-2 text-gray-500 hover:text-blue-500"
      >
        <span class="icon-[mdi--plus] size-6"></span>
        <span>批量添加</span>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div class="flex gap-2">
        <TimePicker
          v-model:value="batchSlots.start"
          :auto-focus="true"
          :format="format"
          :minute-step="30"
          :show-now="false"
        />
        -
        <TimePicker
          v-model:value="batchSlots.end"
          :auto-focus="true"
          :format="format"
          :minute-step="30"
          :show-now="false"
        />
        <Tag
          v-if="showOverDay"
          class="flex items-center justify-center"
          color="red"
        >
          跨天
        </Tag>
        <button
          class="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
          style="margin-left: auto"
          @click="batchAddTimeslot = false"
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
      <VCalendar :attributes="attributes" @dayclick="handleDateClick" />
    </div>
    <Divider orientation="left"> 时段列表 </Divider>

    <List
      :bordered="true"
      :data-source="orderStore.formState.timeslots"
      item-layout="horizontal"
      size="small"
      style="max-height: 400px; overflow: auto"
    >
      <template #renderItem="{ item, index }">
        <ListItem>
          <div class="flex gap-2">
            <RangePicker
              v-model:value="item.slot"
              :allow-clear="false"
              :disabled="!item.canEdit"
              :minute-step="30"
              :show-now="false"
              format="YYYY-MM-DD HH:mm"
              show-time
            />
            <!-- <DatePicker
              v-model:value="item.date"
              :allow-clear="false"
              :disabled="!item.canEdit"
            />
            <TimeRangePicker
              v-model:value="item.slot"
              :allow-clear="false"
              :disabled="!item.canEdit"
              :minute-step="30"
              format="HH:mm"
            /> -->
            <span
              v-if="orderStore.formState.timeslots!.length > 1 && item.canEdit"
              class="icon-[mdi--minus] size-6"
              @click="deleteTimeslot(index)"
            ></span>
            <span
              v-if="index === orderStore.formState.timeslots!.length - 1"
              class="icon-[mdi--plus] size-6"
              @click="addTimeslot"
            ></span>
          </div>
        </ListItem>
      </template>
    </List>
  </div>
</template>

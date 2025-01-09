<script lang="ts" setup>
import { DatePicker, List, ListItem, TimeRangePicker } from 'ant-design-vue';

import { useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'TimeslotsControl',
});

const orderStore = useTimeslotOrderStore();

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
</script>

<template>
  <div>
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
            <DatePicker
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
            />
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

<script lang="ts" setup>
import type { TimeslotModel, TimeslotOrder } from '#/types';

import { computed, onMounted, ref, watch } from 'vue';

import { AccessControl } from '@vben/access';

import { Button, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import SelectFilter from '#/components/selectfilter.vue';
import TimeslotOrderForm from '#/components/timeslotorderform.vue';
import { useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'OrderApendModal',
});

const orderStore = useTimeslotOrderStore();

const maxHeight = computed(() => {
  return window.innerHeight * 0.7;
});

const selectedOrder = ref<number | undefined>(undefined);

// Define a method to handle the button click
const handleConfirmAppend = () => {
  // Add your logic here
  orderStore.makeOrders();
};

orderStore.$subscribe((_, state) => {
  if (!state.showApendModal) {
    selectedOrder.value = undefined;
  }
});

onMounted(() => {
  if (orderStore.currentSelectedOrder) {
    selectedOrder.value = orderStore.currentSelectedOrder.id;
  } else {
    selectedOrder.value = undefined;
    orderStore.formState = {
      enableEdit: true,
    };
  }
});

watch(selectedOrder, (newVal) => {
  let order: TimeslotOrder | undefined;

  if (newVal) {
    const findOrder = orderStore.orderById(newVal);
    if (findOrder) {
      order = findOrder;
    }
  }

  if (order) {
    const timeslots: TimeslotModel[] = order.timeslots.map((timeslot) => {
      return {
        canEdit: false,
        date: dayjs(timeslot.date),
        id: timeslot.id,
        slot: [
          dayjs(`${timeslot.date} ${timeslot.start_time}`),
          dayjs(`${timeslot.end_date} ${timeslot.end_time}`),
        ],
      };
    });
    orderStore.formState = {
      agency: order.agency_id,
      contentId: order.contents[0]?.id,
      enableEdit: false,
      formType: 'apend',
      orderId: order.id,
      roomId: order.room_id,
      timeslots,
    };
  }
});

function onModalCancel() {
  selectedOrder.value = undefined;
}
</script>

<template>
  <Modal
    v-model:open="orderStore.showApendModal"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    :title="$t('apendorder')"
    style="top: 10px; width: 50%"
    @cancel="orderStore.showApendModal = false"
    @on-cancel="onModalCancel"
  >
    <div class="flex h-full w-full flex-1 flex-col">
      <SelectFilter
        v-if="orderStore.currentSelectedOrder === undefined"
        v-model="selectedOrder"
        :options="orderStore.orderOptions"
        :title="$t('selectorder')"
        mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
        width="min-w-[300px]"
      />
      <TimeslotOrderForm v-if="selectedOrder !== undefined" />
    </div>

    <template #footer>
      <AccessControl :codes="['super']">
        <Button
          key="submit"
          :disabled="!orderStore.canAppendOrder"
          type="primary"
          @click="handleConfirmAppend"
        >
          确认追加
        </Button>
      </AccessControl>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { AccessControl } from '@vben/access';

import { Button, Modal } from 'ant-design-vue';

import { useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'OrderDetailModal',
});

const props = defineProps<{}>();
const orderStore = useTimeslotOrderStore();

const maxHeight = computed(() => {
  return window.innerHeight * 0.7;
});

// Define a method to handle the button click
const handleConfirmAppend = () => {
  // Add your logic here
  console.log('Confirm append clicked');
};
</script>

<template>
  <Modal
    v-model:open="orderStore.showApendModal"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    style="top: 10px; width: 60%"
    title="追加订单"
    @cancel="orderStore.showApendModal = false"
  >
    <div class="flex h-full flex-1 flex-col"></div>

    <template #footer>
      <AccessControl :codes="['super']">
        <Button key="submit" type="primary" @click="handleConfirmAppend">
          确认追加
        </Button>
      </AccessControl>
    </template>
  </Modal>
</template>

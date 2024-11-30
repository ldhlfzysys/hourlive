<script lang="ts" setup>
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { DatePicker, Input, Modal, notification } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSampleShippingStore } from '#/store';

defineOptions({
  name: 'ConfirmShippingForm',
});

const sampleShippingStore = useSampleShippingStore();
const receivedDate = ref(dayjs()); // 默认今天

async function handleOk() {
  if (sampleShippingStore.sampleShippingCreate.id) {
    try {
      await sampleShippingStore.agencyUpdate({
        id: sampleShippingStore.sampleShippingCreate.id,
        receiver_name: sampleShippingStore.sampleShippingCreate.receiver_name,
        receiver_time: receivedDate.value.format('YYYY-MM-DD HH:mm:ss'),
      });
      notification.success({
        description: $t('update_success'),
        message: $t('success'),
      });
      sampleShippingStore.showModal = false;
    } catch (error) {
      notification.error({
        description: error.message || $t('update_failed'),
        message: $t('error'),
      });
    }
  }
}
</script>

<template>
  <Modal
    v-model:open="sampleShippingStore.showModal"
    :confirm-loading="sampleShippingStore.sampleShippingUpdateLoading"
    :title="$t('confirm_receipt')"
    centered
    width="500px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col px-4 py-5">
        <div class="mb-4 flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            {{ $t('receiver') }}
          </span>
          <Input
            v-model:value="
              sampleShippingStore.sampleShippingCreate.receiver_name
            "
            class="flex-1 text-sm text-gray-900"
          />
        </div>
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            {{ $t('receiver_time') }}
          </span>
          <DatePicker
            v-model:value="receivedDate"
            :placeholder="$t('select_date')"
            class="flex-1"
            show-time
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

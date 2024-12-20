<script lang="ts" setup>
import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { DatePicker, Input, Modal, notification } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSampleShippingStore } from '#/store';

defineOptions({
  name: 'ConfirmShippingForm',
});

const sampleShippingStore = useSampleShippingStore();

const receiver_time = ref(dayjs());

// 添加 watch 监听器来同步更新 currentSampleShipping
watch(
  receiver_time,
  (newValue) => {
    sampleShippingStore.currentSampleShipping.receiver_time = newValue.format(
      'YYYY-MM-DD HH:mm:ss',
    );
  },
  { immediate: true },
);

async function handleOk() {
  if (sampleShippingStore.currentSampleShipping.id) {
    try {
      await sampleShippingStore.agencyUpdate();
      notification.success({
        description: $t('receiver_success'),
        message: $t('success'),
      });
    } catch (error) {
      console.error(error);
      notification.error({
        description: $t('receiver_failed'),
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
              sampleShippingStore.currentSampleShipping.receiver_name
            "
            class="flex-1 text-sm text-gray-900"
          />
        </div>
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            {{ $t('receiver_time') }}
          </span>
          <DatePicker
            v-model:value="receiver_time"
            :placeholder="$t('select_date')"
            class="flex-1"
            format="YYYY-MM-DD HH:mm"
            show-time
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

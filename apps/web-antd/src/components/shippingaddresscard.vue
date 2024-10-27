<script lang="ts" setup>
import type { ShippingAddress } from '#/types';

import { $t } from '@vben/locales';

import { useShippingAddressStore } from '#/store';

defineOptions({
  name: 'ShippingAddressCard',
});

const props = defineProps<{
  shippingaddress: ShippingAddress;
}>();

const shippingAddressStore = useShippingAddressStore();

function editAddress(id: number) {
  shippingAddressStore.showModal = true;
  shippingAddressStore.isEditing = true; // 设置为编辑状态
  shippingAddressStore.shippingAddressCreate = { ...props.shippingaddress };
  console.log('编辑地址:', id);
}

function deleteAddress(id: number) {
  console.log('删除地址:', id);
  const shippingAddressUpdate: ShippingAddress = { ...props.shippingaddress };
  shippingAddressUpdate.hide = 1;
  shippingAddressStore.modifyShippingAddress(shippingAddressUpdate);
}
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border bg-white shadow-lg transition-colors duration-300 hover:bg-gray-100"
  >
    <div class="flex flex-col px-6 py-5 sm:px-8">
      <div class="mb-2 flex flex-row items-center justify-between">
        <h3 class="text-xl font-semibold leading-7 text-gray-800">
          {{ $t('address') }}: {{ props.shippingaddress.address }}
        </h3>
        <div class="text-sm font-medium text-gray-500">
          {{ $t('id') }}: {{ props.shippingaddress.id }}
        </div>
      </div>
      <p class="mb-4 max-w-2xl text-sm text-gray-600">
        {{ $t('remark') }}: {{ props.shippingaddress.remark }}
      </p>
    </div>
    <div
      class="flex flex-row items-center justify-between border-t border-gray-200 px-6 py-4"
    >
      <div class="flex flex-row gap-4">
        <Button type="primary" @click="editAddress(props.shippingaddress.id)">
          {{ $t('edit') }}
        </Button>
        <Button type="danger" @click="deleteAddress(props.shippingaddress.id)">
          {{ $t('delete') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions .ant-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

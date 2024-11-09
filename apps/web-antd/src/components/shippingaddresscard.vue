<script lang="ts" setup>
import type { ShippingAddress } from '#/types';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

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
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <!-- Header部分 -->
    <div
      class="flex items-center justify-between border-b border-gray-100 px-6 py-5"
    >
      <div class="flex items-center gap-3">
        <h3 class="m-0 text-lg font-semibold text-gray-800">
          {{ $t('shipping_address') }}: {{ props.shippingaddress.address }}
        </h3>
        <span class="rounded-md bg-gray-50 px-3 py-1 text-sm text-gray-600">
          ID: {{ props.shippingaddress.id }}
        </span>
      </div>
      <div class="flex gap-3">
        <Button
          class="min-w-[80px]"
          type="primary"
          @click="editAddress(props.shippingaddress.id)"
        >
          {{ $t('edit') }}
        </Button>
        <Button
          class="min-w-[80px]"
          type="danger"
          @click="deleteAddress(props.shippingaddress.id)"
        >
          {{ $t('delete') }}
        </Button>
      </div>
    </div>

    <!-- 内容部分 -->
    <div class="p-6">
      <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-gray-500">{{
            $t('remark')
          }}</span>
          <span class="text-sm text-gray-900">{{
            props.shippingaddress.remark
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 删除所有现有的样式，因为我们现在使用 Tailwind 类 */
</style>

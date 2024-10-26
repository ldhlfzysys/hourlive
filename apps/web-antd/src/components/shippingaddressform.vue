<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, Modal } from 'ant-design-vue';

import { useShippingAddressStore } from '#/store';

defineOptions({
  name: 'ShippingAddressForm',
});

const shippingAddressStore = useShippingAddressStore();

function handleOk() {
  shippingAddressStore.createShippingAddress();
}
</script>

<template>
  <Modal
    v-model:visible="shippingAddressStore.showModal"
    :confirm-loading="shippingAddressStore.shippingAddressCreateLoading"
    :title="$t('create_shipping_address')"
    centered
    width="800px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-row px-4 py-5 sm:px-6">
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.address"
          :placeholder="$t('address')"
          class="mr-3 text-lg font-medium leading-6 text-gray-900"
        />
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.remark"
          :placeholder="$t('remark')"
          class="mt-1 max-w-2xl text-sm text-gray-500"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.product-image {
  width: 100%;
  height: auto;
}

.product-info {
  margin-top: 10px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.middle-content {
  font-size: 16px;
  word-break: break-word;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

::-webkit-scrollbar {
  width: 0;
  height: 7px;
  background-color: #f5f5f5;
}

/* 定义滚动条轨道 内阴影+圆角 */
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 30%);
}

/* 定义滑块 内阴影+圆角 */
::-webkit-scrollbar-thumb {
  background-color: #c8c8c8;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 10%);
}
</style>

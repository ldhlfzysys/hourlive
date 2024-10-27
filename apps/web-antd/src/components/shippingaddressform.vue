<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, Modal } from 'ant-design-vue';

import { useShippingAddressStore } from '#/store';

defineOptions({
  name: 'ShippingAddressForm',
});

const shippingAddressStore = useShippingAddressStore();

function handleOk() {
  if (shippingAddressStore.isEditing) {
    shippingAddressStore.modifyShippingAddress(
      shippingAddressStore.shippingAddressCreate,
    );
  } else {
    shippingAddressStore.createShippingAddress();
  }
}

function handleCancel() {
  shippingAddressStore.showModal = false;
  shippingAddressStore.isEditing = false;
  shippingAddressStore.shippingAddressCreate = { address: '', remark: '' };
}
</script>

<template>
  <Modal
    v-model:visible="shippingAddressStore.showModal"
    :confirm-loading="shippingAddressStore.shippingAddressCreateLoading"
    :title="
      shippingAddressStore.isEditing
        ? $t('edit_shipping_address')
        : $t('create_shipping_address')
    "
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col px-4 py-5 sm:px-6">
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.address"
          :placeholder="$t('address')"
          class="mb-3 text-lg font-medium leading-6 text-gray-900"
        />
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.remark"
          :placeholder="$t('remark')"
          class="text-sm text-gray-500"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* 删除不需要的样式 */
</style>

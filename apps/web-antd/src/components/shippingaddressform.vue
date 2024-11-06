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
    :title="shippingAddressStore.isEditing ? $t('edit') : $t('create')"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="modal-content">
      <div class="input-container">
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.address"
          :placeholder="$t('address')"
          class="address-input"
        />
        <Input
          v-model:value="shippingAddressStore.shippingAddressCreate.remark"
          :placeholder="$t('remark')"
          class="remark-input"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.modal-content {
  overflow: hidden;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
}

.address-input {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
}

.remark-input {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>

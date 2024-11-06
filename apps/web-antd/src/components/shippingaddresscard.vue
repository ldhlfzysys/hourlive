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
  <div class="card">
    <div class="card-content">
      <div class="header">
        <h3 class="title">
          {{ $t('shipping_address') }}: {{ props.shippingaddress.address }}
        </h3>
        <div class="id">{{ $t('id') }}: {{ props.shippingaddress.id }}</div>
      </div>
      <p class="remark">
        {{ $t('remark') }}: {{ props.shippingaddress.remark }}
      </p>
    </div>
    <div class="actions">
      <div class="buttons">
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
.card {
  margin-left: 10px;
  overflow: hidden;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  transition: background-color 0.3s;
}

.card:hover {
  background-color: #f3f4f6;
}

.card-content {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.id {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.remark {
  max-width: 32rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.actions .ant-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

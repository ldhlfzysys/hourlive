<script lang="ts" setup>
import type { ShippingAddress } from '#/types';

import { defineProps } from 'vue';

defineOptions({
  name: 'ShippingAddressCard',
});

const props = defineProps<{
  shippingaddress: ShippingAddress;
}>();

function editAddress(id: number) {
  // 编辑地址的逻辑
  console.log('编辑地址:', id);
}

function deleteAddress(id: number) {
  // 删除地址的逻辑
  console.log('删除地址:', id);
}
</script>

<template>
  <div class="shipping-address-card">
    <div class="info">
      <p><strong>ID:</strong> {{ shippingaddress.id }}</p>
      <p><strong>地址:</strong> {{ shippingaddress.address }}</p>
      <p><strong>备注:</strong> {{ shippingaddress.remark }}</p>
    </div>
    <div class="actions">
      <Button type="primary" @click="editAddress(shippingaddress.id)">
        编辑
      </Button>
      <Button type="danger" @click="deleteAddress(shippingaddress.id)">
        删除
      </Button>
    </div>
  </div>
</template>

<style scoped>
.shipping-address-card {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transition: box-shadow 0.3s ease;
}

.shipping-address-card:hover {
  box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
}

.info {
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions .ant-btn {
  font-size: 12px;
}
</style>

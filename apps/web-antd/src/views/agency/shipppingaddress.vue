<script lang="ts" setup>
import { onMounted } from 'vue';

import { Button } from 'ant-design-vue';

import ShippingAddressCard from '#/components/shippingaddresscard.vue';
import ShippingAddressForm from '#/components/shippingaddressform.vue';
import { useShippingAddressStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const shippingAddressStore = useShippingAddressStore();

onMounted(() => {
  console.log('=====mounted=====');
  shippingAddressStore.queryShippingAddress();
});

function onTop() {}
function onBottom() {
  shippingAddressStore.queryShippingAddress();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <Button type="primary" @click="shippingAddressStore.showModal = true">
        新增收货地址
      </Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :item-size="210"
          :items="shippingAddressStore.shippingAddressList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
        >
          <ShippingAddressCard :shippingaddress="item" />
        </RecycleScroller>
      </div>
      <ShippingAddressForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}
</style>

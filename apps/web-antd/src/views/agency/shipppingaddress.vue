<script lang="ts" setup>
import { onMounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import ShippingAddressCard from '#/components/shippingaddresscard.vue';
import ShippingAddressForm from '#/components/shippingaddressform.vue';
import { useShippingAddressStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
      <Button
        style="margin-top: 10px; margin-bottom: 10px"
        type="primary"
        @click="shippingAddressStore.showModal = true"
      >
        {{ $t('create') }}
      </Button>
      <br />
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="650"
          :item-size="220"
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

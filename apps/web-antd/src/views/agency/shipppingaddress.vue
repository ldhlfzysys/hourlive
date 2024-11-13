<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import ShippingAddressCard from '#/components/shippingaddresscard.vue';
import ShippingAddressForm from '#/components/shippingaddressform.vue';
import { useShippingAddressStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const shippingAddressStore = useShippingAddressStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

onMounted(() => {
  console.log('=====mounted=====');
  shippingAddressStore.queryShippingAddress();
});

function onTop() {}
function onBottom() {
  shippingAddressStore.queryShippingAddress();
}

function onUpdate(
  viewStartIndex: number,
  viewEndIndex: number,
  visibleStartIndex: number,
  visibleEndIndex: number,
) {
  updateParts.value.viewStartIdx = viewStartIndex;
  updateParts.value.viewEndIdx = viewEndIndex;
  updateParts.value.visibleStartIdx = visibleStartIndex;
  updateParts.value.visibleEndIdx = visibleEndIndex;
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
        <DynamicScroller
          v-if="shippingAddressStore.shippingAddressList.length > 0"
          :items="shippingAddressStore.shippingAddressList"
          :min-item-size="100"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :active="active"
              :data-index="index"
              :item="item"
              class="p-4 first:pt-4"
            >
              <ShippingAddressCard :shippingaddress="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <Empty
          v-else
          class="flex-1"
          description="暂无收货地址数据，点击上方按钮添加"
        />
      </div>
      <ShippingAddressForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  padding: 16px;
  padding-bottom: 0;
}

:deep(.vue-recycle-scroller__item-wrapper:last-child) {
  padding-bottom: 16px;
}
</style>

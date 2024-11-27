<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import Empty from '#/components/empty.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleKspForm from '#/components/samplekspform.vue';
import ShippingCard from '#/components/shippingcard.vue';
import { useSampleShippingStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const sampleShippingStore = useSampleShippingStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

onMounted(() => {
  sampleShippingStore.querySampleShipping();
});

function onTop() {}
function onBottom() {
  sampleShippingStore.querySampleShipping();
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
    <template #header> </template>

    <template #content>
      <div class="flex flex-1 flex-col overflow-hidden">
        <DynamicScroller
          v-if="sampleShippingStore.sampleShippingList.length > 0"
          :items="sampleShippingStore.sampleShippingList"
          :min-item-size="250"
          class="scroller h-full"
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
              :size-dependencies="[
                item.express_company,
                item.tracking_number,
                item.sender_name,
                item.sender_time,
                item.receiver_name,
                item.receiver_time,
              ]"
              class="px-4 pt-4 last:pb-4"
            >
              <ShippingCard :sampleshipping="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <Empty
          v-else
          :description="$t('empty_shipping_tip')"
          :loading="sampleShippingStore.sampleShippingLoading"
          class="flex-1"
        />
      </div>
      <ShippingForm />
      <SampleKspForm />
      <OSSFileForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
  overflow-y: auto;
}

:deep(.vue-recycle-scroller__slot) {
  overflow: visible !important;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  overflow: visible !important;
}
</style>

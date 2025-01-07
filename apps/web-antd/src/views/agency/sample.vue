<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { Select, SelectOption } from 'ant-design-vue';

import { useCustomerStore, useSampleStore } from '#/store';
// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

import { $t } from '@vben/locales';

import { useElementBounding } from '@vueuse/core';

import Empty from '#/components/empty.vue';
import SampleCard from '#/components/samplecard.vue';
import SampleForm from '#/components/sampleform.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const sampleStore = useSampleStore();
const customerStore = useCustomerStore();
const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

const itemWidth = ref(300);
const scroller = ref();
function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

const selectedNames = ref([]);
const selectedItems = ref([]);

watch(
  selectedNames,
  (newValue) => {
    console.log('xxxxx', newValue);
  },
  { deep: true },
);

watch(
  selectedItems,
  (newValue) => {
    console.log('222', newValue);
  },
  { deep: true },
);

onMounted(() => {
  sampleStore.querySample();
  customerStore.getAgencyCustomers();
});

function onTop() {}
function onBottom() {
  sampleStore.querySample();
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

function onCustomerChange(value: any) {
  console.log('Customer changed:', value);
  sampleStore.$reset();
  sampleStore.sampleQuery.customer_id = value;
  sampleStore.querySample();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div class="header-container">
        <div style="margin-left: 20px">
          {{ $t('filtercustomer') }}
        </div>
        <Select
          v-model="sampleStore.sampleQuery.customer_id"
          class="custom-select"
          placeholder="请选择"
          @change="onCustomerChange"
        >
          <!-- <Option :key="-1">{{ $t('all') }}</Option> -->
          <SelectOption
            v-for="customer in customerStore.agencyCustomers?.data || []"
            :key="customer.id"
            :value="customer.id"
          >
            {{ customer.code }}
          </SelectOption>
        </Select>
      </div>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-if="sampleStore.sampleList.length > 0"
          ref="scroller"
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="itemWidth"
          :item-size="250"
          :items="sampleStore.sampleList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @resize="onResize"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <SampleCard :sample="item" />
        </RecycleScroller>
        <Empty
          v-else
          :loading="sampleStore.sampleQueryLoading"
          class="flex-1"
          description="暂无样本数据，请选择客户或添加新样本"
        />
      </div>
      <SampleForm />
    </template>

    <!-- <template #footer> 123 </template> -->
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}

.custom-select {
  width: 200px; /* 设置宽度 */
  margin-left: 10px; /* 添加左边距 */
}

.ant-select-selector {
  border-color: #1890ff; /* 边框颜色 */
  border-radius: 8px; /* 圆角 */
}

.ant-select-arrow {
  color: #1890ff; /* 箭头颜色 */
}

.header-container {
  display: flex;
  align-items: center;
}
</style>

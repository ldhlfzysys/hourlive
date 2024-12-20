<script lang="ts" setup>
import type { Sample } from '#/types/ISample';

import SampleShippingForm from '#/components/sampleshippingform.vue';
import {
  useAgencyStore,
  useSampleShippingStore,
  useSampleStore,
} from '#/store';

// @ts-ignore
import { onMounted, ref } from 'vue';

import { Button, Image, InputNumber, Transfer } from 'ant-design-vue';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const sampleStore = useSampleStore();
const agencyStore = useAgencyStore();
const sampleShippingStore = useSampleShippingStore();
function getData() {
  sampleStore.querySample();
}

const targetKeys = ref<string[]>([]);
function createShipping() {
  sampleShippingStore.makeCreate();
  sampleShippingStore.currentSampleShipping.samples =
    sampleStore.sampleList.filter((sample) =>
      targetKeys.value.includes(sample.id),
    );
}

const searchValue = ref('');

// 保留过滤函数
function filterOption(inputValue: string, option: Sample) {
  return option.product_name?.toLowerCase().includes(inputValue.toLowerCase());
}

onMounted(() => {
  sampleStore.querySample();
  agencyStore.fetchAgency();
});

// 简化 handleSearch 函数
function handleSearch(dir: string, value: string) {
  console.log('搜索值:', value, '方向:', dir);
  searchValue.value = value;
}

// 处理数量变化
function handleQuantityChange(item: Sample, value: number) {
  item.sample_count = value;
}

// 确保新添加的项目默认数量为1
function handleChange(keys: string[]) {
  sampleStore.sampleList.forEach((item) => {
    if (keys.includes(item.id) && !item.sample_count) {
      item.sample_count = 1;
    }
  });
  targetKeys.value = keys;
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex h-full">
        <Transfer
          v-model:target-keys="targetKeys"
          :data-source="sampleStore.sampleList"
          :filter-option="filterOption"
          :list-style="{
            width: '50%',
            height: '100%',
            overflow: 'hidden',
          }"
          :operations="[$t('addpackage'), $t('removepackage')]"
          :row-key="(record) => record.id"
          :show-search="true"
          class="w-full flex-1"
          @change="handleChange"
          @search="handleSearch"
        >
          <template #render="item">
            <div
              class="flex h-[100px] w-full flex-row items-center rounded-lg border"
            >
              <div
                class="m-[1px] flex h-[98px] w-[98px] rounded-l-lg bg-gray-200"
              >
                <Image :src="item?.product_image" />
              </div>
              <h3
                class="flex-1 whitespace-normal break-words pl-2 text-base font-semibold text-gray-800"
              >
                {{ item?.product_name }}
              </h3>
              <div v-if="targetKeys.includes(item.id)" class="mr-2" @click.stop>
                <InputNumber
                  v-model:value="item.sample_count"
                  :min="1"
                  :placeholder="$t('sample_count')"
                  size="small"
                  style="width: 80px; margin-left: 3px"
                  @change="(value) => handleQuantityChange(item, value)"
                />
              </div>
            </div>
          </template>
          <template #footer="{ direction }">
            <Button
              v-if="direction === 'left'"
              :loading="sampleStore.sampleQueryLoading"
              size="small"
              style="float: left; margin: 5px"
              @click="getData"
            >
              {{ $t('fetchMoreSample') }}
            </Button>
            <Button
              v-else-if="direction === 'right'"
              size="small"
              style="float: right; margin: 5px"
              type="primary"
              @click="createShipping"
            >
              {{ $t('createshipping') }}
            </Button>
          </template>
        </Transfer>
      </div>
      <SampleShippingForm />
    </template>

    <template #footer> </template>
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
</style>

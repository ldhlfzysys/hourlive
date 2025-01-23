<script lang="ts" setup>
import type { Sample } from '#/types/ISample';

import SampleShippingForm from '#/components/sampleshippingform.vue';
import {
  useAgencyStore,
  useSampleShippingStore,
  useSampleStore,
} from '#/store';

// @ts-ignore
import { nextTick, onMounted, ref } from 'vue';

import { Button, Image, message, Transfer } from 'ant-design-vue';

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
  // 检查右侧样品数量
  const selectedSamples = sampleStore.sampleList.filter((sample) =>
    targetKeys.value.includes(sample.id),
  );

  if (
    selectedSamples.some(
      (sample) => !sample.sample_count || sample.sample_count <= 0,
    )
  ) {
    message.warning('请正确填写所有样品数量，数量必须大于0');
    return;
  }

  sampleShippingStore.makeCreate();
  sampleShippingStore.currentSampleShipping.samples = selectedSamples;
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
  if (value <= 0) {
    // 如果输入值小于等于0，提示用户并重置为0
    message.warning('样品数量不能小于0');
    item.sample_count = 0;
    return;
  }
  item.sample_count = value;
}

// 将新添加项目的默认数量改为0
function handleChange(keys: string[]) {
  const addedKeys = new Set(
    keys.filter((key) => !targetKeys.value.includes(key)),
  );
  sampleStore.sampleList.forEach((item) => {
    if (addedKeys.has(item.id)) {
      // 确保明确设置为数字 0
      item.sample_count = 0;
      // 强制更新
      nextTick(() => {
        item.sample_count = 0;
      });
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
                class="m-[1px] flex h-[98px] min-w-[98px] max-w-[98px] items-center justify-center rounded-l-lg bg-gray-200"
              >
                <Image
                  :preview="false"
                  :src="item?.product_image"
                  class="h-[98px] w-[98px] object-contain"
                />
              </div>
              <div
                v-if="!targetKeys.includes(item.id)"
                class="flex flex-1 flex-col justify-center px-3"
              >
                <h3
                  class="multi-line whitespace-normal break-words text-base font-semibold text-gray-800"
                >
                  {{ item?.product_name }}
                </h3>
              </div>
              <template v-else>
                <div
                  class="flex min-w-0 flex-1 flex-col justify-center gap-2 px-3"
                  style="max-width: calc(100% - 200px)"
                >
                  <h3
                    class="single-line whitespace-normal break-words text-base font-semibold text-gray-800"
                  >
                    {{ item?.product_name }}
                  </h3>
                  <div class="flex w-full items-center" @click.stop>
                    <input
                      v-model="item.sample_mark"
                      :placeholder="$t('sample_mark_desc')"
                      class="ant-input ant-input-sm w-full border-black"
                      type="text"
                    />
                  </div>
                </div>
                <div class="flex min-w-[100px] items-center px-3" @click.stop>
                  <input
                    v-model="item.sample_count"
                    :placeholder="$t('sample_count')"
                    class="ant-input ant-input-sm border-black"
                    min="0"
                    style="width: 80px"
                    type="number"
                    @input="
                      (e) =>
                        handleQuantityChange(
                          item,
                          Number((e.target as HTMLInputElement).value),
                        )
                    "
                  />
                </div>
              </template>
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

.border-black {
  border: 1px solid black !important;
}

.single-line {
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: initial;
  white-space: nowrap;
  -webkit-box-orient: initial;
}

.multi-line {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>

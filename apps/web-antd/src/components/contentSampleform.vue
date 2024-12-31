<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { $t } from '@vben/locales';

import { useElementBounding } from '@vueuse/core';
import { Button, Checkbox, Image, InputSearch, Modal } from 'ant-design-vue';
import { Trash2 } from 'lucide-vue-next';

import { useContentStore, useSampleStore } from '#/store';

import Empty from './empty.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

defineOptions({
  name: 'ContentSampleForm',
});

const sampleStore = useSampleStore();
const contentStore = useContentStore();

const scroller = ref();
const itemWidth = ref(300);
const selectedSamples = ref<string[]>([]);
const searchText = ref('');

function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

// 获取更多样品
function getData() {
  sampleStore.querySample();
}

// 批量添加样品
async function handleBatchAdd() {
  if (selectedSamples.value.length === 0) return;

  contentStore.addSample = {
    content_id: contentStore.contentCreate.id!,
    sample_ids: selectedSamples.value,
  };
  await contentStore.addSamples();
  selectedSamples.value = []; // 清空选择
}

// 删除样品
async function handleRemove(sampleId: string) {
  contentStore.addSample = {
    content_id: contentStore.contentCreate.id!,
    sample_ids: [sampleId],
  };
  await contentStore.removeSamples();
}

// 虚拟滚动相关
function onBottom() {
  sampleStore.querySample();
}

function onTop() {}

// 处理单个选择
function handleSelect(sampleId: string, checked: boolean) {
  if (checked) {
    selectedSamples.value.push(sampleId);
  } else {
    selectedSamples.value = selectedSamples.value.filter(
      (id) => id !== sampleId,
    );
  }
}

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

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

function getSampleType(isMain: string) {
  switch (isMain) {
    case '0': {
      return 'sample_welfare';
    }
    case '1': {
      return 'sample_main';
    }
    case '2': {
      return 'sample_deal';
    }
    case '3': {
      return 'sample_normal';
    }
    case '4': {
      return 'sample_new';
    }
    default: {
      return '';
    }
  }
}

// 过滤商品列表
const filteredProducts = computed(() => {
  if (!searchText.value) {
    return sampleStore.sampleList; // 原始商品列表
  }

  return sampleStore.sampleList.filter((item) =>
    item.product_name.toLowerCase().includes(searchText.value.toLowerCase()),
  );
});

// 搜索处理函数
const handleSearch = () => {
  // 如果需要额外处理，可以在这里添加逻辑
};

onMounted(() => {
  sampleStore.querySample();
});
</script>

<template>
  <Modal
    v-model:open="contentStore.showSampleManagerModal"
    :footer="null"
    :title="$t('sample_management')"
    centered
    width="1200px"
  >
    <div class="flex h-[600px] gap-4">
      <!-- 左侧可选样品列表 -->
      <div class="flex w-1/2 flex-col overflow-hidden rounded-lg border">
        <div class="flex items-center justify-between border-b p-4 font-medium">
          <span>{{ $t('available_samples') }}</span>
          <Button
            :disabled="selectedSamples.length === 0"
            type="primary"
            @click="handleBatchAdd"
          >
            {{ $t('add_selected') }}
          </Button>
        </div>
        <div class="flex-1 overflow-hidden">
          <InputSearch
            v-model:value="searchText"
            :placeholder="$t('请输入商品名称')"
            allow-clear
            style="margin-bottom: 16px"
          />
          <RecycleScroller
            v-if="sampleStore.sampleList.length > 0"
            ref="scroller"
            v-slot="{ item }"
            :emit-update="true"
            :item-size="180"
            :items="filteredProducts"
            :page-mode="false"
            class="h-full"
            key-field="id"
            @resize="onResize"
            @scroll-end="onBottom"
            @scroll-start="onTop"
            @update="onUpdate"
          >
            <div class="px-2 py-1">
              <div
                class="flex min-h-[160px] cursor-pointer items-center rounded-lg border p-4"
                @click="
                  handleSelect(item.id, !selectedSamples.includes(item.id))
                "
              >
                <Checkbox
                  :checked="selectedSamples.includes(item.id)"
                  class="mr-2"
                  @change="(e) => handleSelect(item.id, e.target.checked)"
                  @click.stop
                />
                <div
                  class="relative m-[1px] flex h-[140px] w-[140px] rounded-lg bg-gray-200"
                >
                  <Image
                    :src="item?.product_image"
                    class="h-full w-full rounded-lg object-cover"
                  />
                  <div
                    :class="[
                      item.is_main === '1' ? 'bg-red-500/60' : 'bg-black/60',
                    ]"
                    class="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                  >
                    {{ $t(getSampleType(item.is_main)) }}
                  </div>
                </div>
                <div class="flex min-w-0 flex-1 flex-col px-4">
                  <h3 class="line-clamp-2 text-lg font-medium text-gray-900">
                    {{ item?.product_name }}
                  </h3>
                  <div class="mt-3 flex items-center space-x-3 text-sm">
                    <span class="text-gray-500"
                      >ID: {{ item?.product_id }}</span
                    >
                  </div>
                  <div class="mt-4 flex items-baseline space-x-3">
                    <span class="text-xl font-bold text-blue-600">{{
                      item?.product_final_price
                    }}</span>
                    <span class="text-sm text-gray-400 line-through">{{
                      item?.product_srp
                    }}</span>
                    <span
                      class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
                    >
                      {{ item?.product_discount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </RecycleScroller>
          <Empty
            v-else
            :loading="sampleStore.sampleQueryLoading"
            class="flex-1"
          />
        </div>
        <div class="border-t p-2">
          <Button
            :loading="sampleStore.sampleQueryLoading"
            block
            @click="getData"
          >
            {{ $t('fetch_more_sample') }}
          </Button>
        </div>
      </div>

      <!-- 右侧已选样品列表 -->
      <div class="flex w-1/2 flex-col overflow-hidden rounded-lg border">
        <div class="border-b p-4 font-medium">{{ $t('selected_samples') }}</div>
        <div class="flex-1 overflow-y-auto p-4">
          <div
            v-for="sample in contentStore.contentCreate.samples"
            :key="sample.id"
            class="mb-4 flex min-h-[160px] items-center rounded-lg border p-4"
          >
            <div
              class="relative m-[1px] flex h-[140px] w-[140px] rounded-lg bg-gray-200"
            >
              <Image
                :src="sample?.product_image"
                class="h-full w-full rounded-lg object-cover"
              />
              <div
                :class="[
                  sample.is_main === '1' ? 'bg-red-500/60' : 'bg-black/60',
                ]"
                class="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                {{ $t(getSampleType(sample.is_main)) }}
              </div>
            </div>
            <div class="flex min-w-0 flex-1 flex-col px-4">
              <h3 class="line-clamp-2 text-lg font-medium text-gray-900">
                {{ sample?.product_name }}
              </h3>
              <div class="mt-3 flex items-center space-x-3 text-sm">
                <span class="text-gray-500">ID: {{ sample?.product_id }}</span>
              </div>
              <div class="mt-4 flex items-baseline space-x-3">
                <span class="text-xl font-bold text-blue-600">{{
                  sample?.product_final_price
                }}</span>
                <span class="text-sm text-gray-400 line-through">{{
                  sample?.product_srp
                }}</span>
                <span
                  class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
                >
                  {{ sample?.product_discount }}
                </span>
              </div>
            </div>
            <Button
              class="flex items-center"
              danger
              type="link"
              @click="handleRemove(sample.id)"
            >
              <Trash2 class="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.ant-checkbox-wrapper {
  flex-shrink: 0;
}

:deep(.vue-recycle-scroller) {
  height: 100% !important;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  overflow: visible !important;
}

:deep(.vue-recycle-scroller__item-view) {
  margin: 0 !important;
  overflow: visible !important;
}
</style>

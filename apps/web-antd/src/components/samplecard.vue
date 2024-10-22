<script lang="ts" setup>
import type { Sample } from '#/types';

import { $t } from '@vben/locales';

defineOptions({
  name: 'SampleCard',
});

const props = defineProps<{
  sample: Sample;
}>();
</script>

<template>
  <div class="flex h-[200px] w-full">
    <div class="m-2 flex flex-row">
      <div class="w-[170px] place-items-center bg-white">
        <img
          :src="props.sample.product_image"
          alt="tailwind logo"
          class="rounded-xl"
        />
      </div>
      <div class="flex flex-1 flex-col bg-white p-3">
        <div class="flex justify-between">
          <div class="flex">
            <a
              class="flex text-xs text-blue-500"
              href="props.sample.product_link"
              target="_blank"
              >{{ props.sample.product_id }}</a
            >
            <div class="ml-2 flex text-xs">
              <div v-if="props.sample.is_main === '1'">
                【{{ $t('sample_main') }}】
              </div>
              <div v-if="props.sample.is_main === '0'">
                【{{ $t('sample_welfare') }}】
              </div>
              <div v-if="props.sample.is_main === '2'">
                【{{ $t('sample_deal') }}】
              </div>
            </div>
          </div>
          <div class="flex">
            <a
              class="px-3 py-1 text-xs text-blue-500"
              href="props.sample.product_link"
              target="_blank"
              >{{ $t('scriptmanager') }}</a
            >
            <div
              class="bg-primary block rounded-full px-3 py-1 text-xs font-medium text-white"
            >
              {{ $t('edit') }}
            </div>
          </div>
        </div>
        <span class="line-clamp-1 text-sm font-black text-gray-800">
          {{ props.sample.product_name }}
        </span>

        <div
          class="w-5/6 flex-1 overflow-y-scroll text-xs text-gray-500"
          v-html="props.sample.product_ksp"
        ></div>
        <p class="text-sm font-black text-gray-800">
          {{ props.sample.product_srp }}
          <span class="text-sm font-normal text-gray-600 line-through">{{
            props.sample.product_final_price
          }}</span>
          <span class="ml-3 text-sm font-normal text-red-500">{{
            props.sample.product_discount
          }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-image {
  width: 100%;
  height: auto;
}

.product-info {
  margin-top: 10px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.middle-content {
  font-size: 16px;
  word-break: break-word;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

::-webkit-scrollbar {
  width: 0;
  height: 7px;
  background-color: #f5f5f5;
}

/* 定义滚动条轨道 内阴影+圆角 */
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 30%);
}

/* 定义滑块 内阴影+圆角 */
::-webkit-scrollbar-thumb {
  background-color: #c8c8c8;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 10%);
}
</style>

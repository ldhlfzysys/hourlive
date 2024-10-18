<script lang="ts" setup>
import type { Sample } from '#/types';

import { ref } from 'vue';

defineOptions({
  name: 'SampleCard',
});

const props = defineProps<{
  sample: Sample;
}>();

const sellingPoints = ref(
  '<p>这是一个非常大的卖点展示区域，支持HTML内容。</p>',
);
</script>

<template>
  <div class="flex flex-col justify-center">
    <div
      class="relative mx-auto flex max-w-xs flex-col space-y-3 rounded-xl border border-white bg-white p-3 shadow-lg md:max-w-3xl md:flex-row md:space-x-5 md:space-y-0"
    >
      <div class="grid w-full place-items-center bg-white md:w-1/3">
        <img
          alt="tailwind logo"
          class="rounded-xl"
          src="https://images.pexels.com/photos/4381392/pexels-photo-4381392.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
        />
      </div>
      <div class="flex w-full flex-col space-y-2 bg-white p-3 md:w-2/3">
        <div class="item-center flex justify-between">
          <p class="hidden font-medium text-gray-500 md:block">Vacations</p>
          <div class="flex items-center">
            <svg
              class="h-5 w-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <p class="ml-1 text-sm font-bold text-gray-600">
              4.96
              <span class="font-normal text-gray-500">(76 reviews)</span>
            </p>
          </div>
          <div class="">
            <svg
              class="h-5 w-5 text-pink-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                fill-rule="evenodd"
              />
            </svg>
          </div>
          <div
            class="hidden rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 md:block"
          >
            Superhost
          </div>
        </div>
        <h3 class="text-xl font-black text-gray-800 md:text-3xl">
          The Majestic and Wonderful Bahamas
        </h3>
        <p class="text-base text-gray-500 md:text-lg">
          The best kept secret of The Bahamas is the country’s sheer size and
          diversity. With 16 major islands, The Bahamas is an unmatched
          destination
        </p>
        <p class="text-xl font-black text-gray-800">
          $110
          <span class="text-base font-normal text-gray-600">/night</span>
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
</style>

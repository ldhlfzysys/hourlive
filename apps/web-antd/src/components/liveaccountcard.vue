<script lang="ts" setup>
import type { LiveAccount } from '#/types';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useLiveAccountStore } from '#/store';

defineOptions({
  name: 'LiveAccountCard',
});

const props = defineProps<{
  liveaccount: LiveAccount;
}>();

const liveaccountStore = useLiveAccountStore();
</script>

<template>
  <div class="overflow-hidden rounded-lg border bg-white shadow">
    <div class="flex flex-row items-center px-4 py-5 sm:px-6">
      <h3 class="mr-3 flex text-lg font-medium leading-6 text-gray-900">
        {{ props.liveaccount.name }}
      </h3>
      <p class="mt-1 flex max-w-2xl text-sm text-gray-500">
        {{ props.liveaccount.code }}
      </p>
      <Button
        class="ml-auto flex"
        type="primary"
        @click="liveaccountStore.makeUpdate(props.liveaccount.id!)"
      >
        {{ $t('edit') }}
      </Button>
    </div>
    <div class="flex flex-row justify-between">
      <div class="flex flex-col border-t border-gray-200 px-4 py-5 sm:p-0">
        <div class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">
              {{ $t('mobile') }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ props.liveaccount.mobile }}
            </dd>
          </div>
        </div>
        <div class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">
              {{ $t('email') }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ props.liveaccount.email }}
            </dd>
          </div>
        </div>
      </div>
      <div class="flex flex-col border-t border-gray-200 px-4 py-5 sm:p-0">
        <div class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">
              {{ $t('liveaccount') }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ props.liveaccount.live_account }}
            </dd>
          </div>
        </div>
        <div class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">
              {{ $t('live_uid') }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ props.liveaccount.live_uid }}
            </dd>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">
              {{ $t('platform') }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ props.liveaccount.platform }}
            </dd>
          </div>
        </dl>
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

<script lang="ts" setup>
import type { Content } from '#/types';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useContentStore, useLiveAccountStore } from '#/store';

defineOptions({
  name: 'ContentCard',
});

const props = defineProps<{
  content: Content;
}>();

const contentStore = useContentStore();
const liveaccountStore = useLiveAccountStore();

const liveaccount = computed(() => {
  return liveaccountStore.liveaccountById(props.content.liveaccount_id!);
});
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <!-- Header部分 -->
    <div
      class="flex items-center justify-between border-b border-gray-100 px-6 py-5"
    >
      <div class="flex items-center gap-3">
        <h3 class="m-0 text-lg font-semibold text-gray-800">
          {{ props.content.id }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ props.content.content_text }}
        </p>
      </div>
      <Button
        class="min-w-[80px]"
        type="primary"
        @click="contentStore.makeUpdate(props.content.id!)"
      >
        {{ $t('edit') }}
      </Button>
    </div>

    <!-- 内容部分 -->
    <div class="p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- 第一列 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('shop_name')
              }}</span>
              <span class="text-sm text-gray-900">{{ liveaccount?.name }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('shop_code')
              }}</span>
              <span class="text-sm text-gray-900">{{ liveaccount?.code }}</span>
            </div>
          </div>
        </div>

        <!-- 第二列 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('liveaccount')
              }}</span>
              <span class="text-sm text-gray-900">{{
                liveaccount?.live_account
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('live_uid')
              }}</span>
              <span class="text-sm text-gray-900">{{
                liveaccount?.live_uid
              }}</span>
            </div>
          </div>
        </div>

        <!-- 第三列 -->
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('platform')
            }}</span>
            <span class="text-sm text-gray-900">{{
              liveaccount?.platform
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

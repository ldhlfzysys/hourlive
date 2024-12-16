<script lang="ts" setup>
import type { LiveAccount } from '#/types';

import { AccessControl } from '@vben/access';
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
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <!-- Header部分 -->
    <div
      class="flex items-center justify-between border-b border-gray-100 px-6 py-5"
    >
      <div class="flex items-center gap-3">
        <h3 class="m-0 text-lg font-semibold text-gray-800">
          {{ props.liveaccount.name }}
        </h3>
        <span class="rounded-md bg-gray-50 px-3 py-1 text-sm text-gray-600">
          {{ props.liveaccount.code }}
        </span>
      </div>
      <AccessControl :codes="['customer']">
        <Button
          class="min-w-[80px]"
          type="primary"
          @click="liveaccountStore.makeUpdate(props.liveaccount.id!)"
        >
          {{ $t('edit') }}
        </Button>
      </AccessControl>
    </div>

    <!-- 内容部分 -->
    <div class="p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('mobile')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.liveaccount.mobile
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('email')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.liveaccount.email
              }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('liveaccount')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.liveaccount.live_account
              }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-500">{{
                $t('live_uid')
              }}</span>
              <span class="text-sm text-gray-900">{{
                props.liveaccount.live_uid
              }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('platform')
            }}</span>
            <span class="text-sm text-gray-900">{{
              props.liveaccount.platform
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

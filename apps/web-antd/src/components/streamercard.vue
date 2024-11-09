<script lang="ts" setup>
import type { Streamer } from '#/types';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

import { useStreamerStore } from '#/store';

defineOptions({
  name: 'StreamerCard',
});

const props = defineProps<{
  streamer: Streamer;
}>();

const streamerStore = useStreamerStore();

function editStreamer(id: number) {
  streamerStore.showModal = true;
  streamerStore.isEditing = true;
  streamerStore.streamerCreate = { ...props.streamer };
}

function deleteStreamer(id: number) {
  const streamerUpdate: Streamer = { ...props.streamer };
  streamerUpdate.hide = 1;
  streamerStore.modifyStreamer(streamerUpdate);
}
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
          {{ $t('username') }}: {{ props.streamer.name }}
        </h3>
        <span class="rounded-md bg-gray-50 px-3 py-1 text-sm text-gray-600">
          ID: {{ props.streamer.id }}
        </span>
      </div>
      <div class="flex gap-3">
        <Button
          class="min-w-[80px]"
          type="primary"
          @click="editStreamer(props.streamer.id)"
        >
          {{ $t('edit') }}
        </Button>
        <Button
          class="min-w-[80px]"
          type="danger"
          @click="deleteStreamer(props.streamer.id)"
        >
          {{ $t('delete') }}
        </Button>
      </div>
    </div>

    <!-- 内容部分 -->
    <div class="p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('account')
            }}</span>
            <span class="text-sm text-gray-900">{{
              props.streamer.user.account
            }}</span>
          </div>
        </div>

        <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('create_time')
            }}</span>
            <span class="text-sm text-gray-900">{{
              props.streamer.create_time
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, Modal } from 'ant-design-vue';

import { useStreamerStore } from '#/store';

defineOptions({
  name: 'StreamerForm',
});

const streamerStore = useStreamerStore();

function handleOk() {
  streamerStore.createStreamer();
}

function handleCancel() {
  streamerStore.showModal = false;
  streamerStore.isEditing = false;
  streamerStore.streamerCreate = { account: '', name: '', password: '' };
}
</script>

<template>
  <Modal
    v-model:visible="streamerStore.showModal"
    :confirm-loading="streamerStore.streamerCreateLoading"
    :title="streamerStore.isEditing ? $t('edit_streamer') : $t('createmember')"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col px-4 py-5 sm:px-6">
        <Input
          v-model:value="streamerStore.streamerCreate.account"
          :placeholder="$t('account')"
          class="mb-3 text-lg font-medium leading-6 text-gray-900"
        />
        <Input
          v-model:value="streamerStore.streamerCreate.password"
          :placeholder="$t('password')"
          class="mb-3 text-lg font-medium leading-6 text-gray-900"
          type="password"
        />
        <Input
          v-model:value="streamerStore.streamerCreate.name"
          :placeholder="$t('name')"
          class="mb-3 text-lg font-medium leading-6 text-gray-900"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* 删除不需要的样式 */
</style>

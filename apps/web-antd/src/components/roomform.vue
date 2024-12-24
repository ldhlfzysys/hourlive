<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, Modal } from 'ant-design-vue';

import { useRoomStore } from '#/store';

defineOptions({
  name: 'RoomForm',
});

const roomStore = useRoomStore();

function handleOk() {
  if (roomStore.roomUpdate.id) {
    roomStore.modifyRoom();
  } else {
    roomStore.createRoom();
  }
}

function handleCancel() {
  roomStore.showModal = false;
  roomStore.roomUpdate = {};
}
</script>

<template>
  <Modal
    v-model:visible="roomStore.showModal"
    :confirm-loading="roomStore.roomCreateLoading"
    :title="roomStore.isEditing ? $t('edit') : $t('create')"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col px-4 py-5 sm:px-6">
        <Input
          v-model:value="roomStore.roomUpdate.name"
          :placeholder="$t('room_name')"
          class="mb-3 text-lg font-medium leading-6 text-gray-900"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* 删除不需要的样式 */
</style>

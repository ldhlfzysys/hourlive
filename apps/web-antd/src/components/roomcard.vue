<script lang="ts" setup>
import type { Room } from '#/types';

import { $t } from '@vben/locales';

import { useRoomStore } from '#/store';

defineOptions({
  name: 'RoomCard',
});

const props = defineProps<{
  room: Room;
}>();

const roomStore = useRoomStore();

function editRoom(id: number) {
  roomStore.showModal = true;
  roomStore.isEditing = true; // 设置为编辑状态
  roomStore.roomCreate = { ...props.room };
  console.log('编辑直播间:', id);
}

function deleteRoom(id: number) {
  console.log('删除直播间:', id);
  roomStore.removeRoom(id);
}
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border bg-white shadow-lg transition-colors duration-300 hover:bg-gray-100"
  >
    <div class="flex flex-col px-6 py-5 sm:px-8">
      <div class="mb-2 flex flex-row items-center justify-between">
        <h3 class="text-xl font-semibold leading-7 text-gray-800">
          {{ room.name }}
        </h3>
        <div class="text-sm font-medium text-gray-500">
          {{ $t('id') }}: {{ room.id }}
        </div>
      </div>
      <div class="mb-4 flex flex-row justify-between text-sm text-gray-600">
        <p>{{ $t('create_time') }}: {{ room.create_time }}</p>
        <p>{{ $t('create_time') }}: {{ room.update_time }}</p>
      </div>
    </div>
    <div
      class="flex flex-row items-center justify-between border-t border-gray-200 px-6 py-4"
    >
      <div class="flex flex-row gap-4">
        <Button type="primary" @click="editRoom(room.id)">
          {{ $t('edit') }}
        </Button>
        <Button type="danger" @click="deleteRoom(room.id)">
          {{ $t('delete') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions .ant-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

<script lang="ts" setup>
import type { Room } from '#/types';

import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

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
  roomStore.isEditing = true;
  roomStore.roomCreate = { ...props.room };
}

function deleteRoom(id: number) {
  roomStore.removeRoom(id);
}
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <div
      class="flex items-center justify-between border-b border-gray-100 px-6 py-5"
    >
      <div class="flex items-center gap-3">
        <h3 class="m-0 text-lg font-semibold text-gray-800">
          {{ $t('room') }}: {{ props.room.name }}
        </h3>
        <span class="rounded-md bg-gray-50 px-3 py-1 text-sm text-gray-600">
          ID: {{ props.room.id }}
        </span>
      </div>
      <div class="flex gap-3">
        <Button
          class="min-w-[80px]"
          type="primary"
          @click="editRoom(props.room.id)"
        >
          {{ $t('edit') }}
        </Button>
        <Button
          class="min-w-[80px]"
          type="danger"
          @click="deleteRoom(props.room.id)"
        >
          {{ $t('delete') }}
        </Button>
      </div>
    </div>

    <div class="p-6">
      <div class="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('create_time')
            }}</span>
            <span class="text-sm text-gray-900">{{
              props.room.create_time
            }}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-500">{{
              $t('update_time')
            }}</span>
            <span class="text-sm text-gray-900">{{
              props.room.update_time
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

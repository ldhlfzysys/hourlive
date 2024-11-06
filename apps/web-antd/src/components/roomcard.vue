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
  <div class="room-card">
    <div class="room-card-content">
      <div class="room-card-header">
        <h3 class="room-card-title">
          {{ room.name }}
        </h3>
        <div class="room-card-id">{{ $t('id') }}: {{ room.id }}</div>
      </div>
      <div class="room-card-info">
        <p>{{ $t('create_time') }}: {{ room.create_time }}</p>
        <p>{{ $t('create_time') }}: {{ room.update_time }}</p>
      </div>
    </div>
    <div class="room-card-actions">
      <div class="room-card-buttons">
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
.room-card {
  margin-left: 10px;
  overflow: hidden;
  background-color: white;
  border: 1px solid;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  transition: background-color 0.3s;
}

.room-card:hover {
  background-color: #f7fafc;
}

.room-card-content {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
}

.room-card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.room-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: #1a202c;
}

.room-card-id {
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
}

.room-card-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.room-card-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.room-card-buttons {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.actions .ant-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

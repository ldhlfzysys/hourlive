<script lang="ts" setup>
import type { Streamer } from '#/types';

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
  console.log('编辑主播:', id);
}

function deleteStreamer(id: number) {
  console.log('删除主播:', id);
  const streamerUpdate: Streamer = { ...props.streamer };
  streamerUpdate.hide = 1;
  streamerStore.modifyStreamer(streamerUpdate);
}
</script>

<template>
  <div class="streamer-card">
    <div class="content">
      <div class="header">
        <h3>
          <div class="info">
            <span>{{ $t('username') }}： {{ streamer.name }}</span>
            <span>{{ $t('account') }}： {{ streamer.user.account }}</span>
          </div>
        </h3>
        <div class="details">
          <p class="right-align">
            {{ $t('id') }}: {{ streamer.id }} | {{ $t('create_time') }}:
            {{ streamer.create_time }}
          </p>
        </div>
      </div>
      <div class="actions">
        <Button type="danger" @click="deleteStreamer(streamer.id)">
          {{ $t('delete') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.streamer-card {
  width: 100%;
  max-height: 200px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  transition: background-color 0.3s ease;
}

.streamer-card:hover {
  background-color: #f0f0f0;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.header {
  margin-bottom: 16px;
}

.info {
  display: flex;
  gap: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.details {
  font-size: 14px;
  color: #666;
}

.right-align {
  text-align: right;
}

.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.actions .ant-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>

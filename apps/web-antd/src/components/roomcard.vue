<script lang="ts" setup>
import type { CreateHardwareToRoom, Room } from '#/types';

import { $t } from '@vben/locales';

import { Button, message, Upload } from 'ant-design-vue';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';

import { useOSSFileStore, useRoomStore } from '#/store';

defineOptions({
  name: 'RoomCard',
});

const props = defineProps<{
  room: Room;
}>();

const roomStore = useRoomStore();

const ossFileStore = useOSSFileStore();

function editRoom(id: number) {
  roomStore.showModal = true;
  roomStore.makeRoomUpdate(id);
}

function editRoomDesc(id: number) {
  roomStore.showRoomDescModal = true;
  roomStore.makeRoomUpdate(id);
}

function deleteRoom(id: number) {
  roomStore.removeRoom(id);
}

function deleteHardware(hardwareId: number) {
  roomStore.deleteHardwareFromRoom(
    {
      id: hardwareId,
    },
    props.room.id,
  );
}

const handleHardwareImageChange = async (info) => {
  const isImage = info.file.type.startsWith('image/');
  const isLt10M = info.file.size / 1024 / 1024 < 10;

  if (!isImage) {
    message.error('文件格式不正确，请上传图片文件');
    return;
  }

  if (!isLt10M) {
    message.error('图片大小不能超过10MB');
    return;
  }

  try {
    const result = await ossFileStore.uploadHardware(info.file);
    if (result && result.success) {
      // 创建新的硬件记录
      const newHardware: CreateHardwareToRoom = {
        hardware: {
          image: result.data,
          name: '新硬件',
          room_id: props.room.id,
        },
        room_id: props.room.id,
      };

      await roomStore.createHardwareToRoom(newHardware);
      // 重新获取该房间的硬件列表
      // await roomStore.queryHardware(props.room.id);
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    message.error('图片上传失败');
  }
};
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
      <div
        class="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4"
      >
        <div class="space-y-2">
          <div class="text-sm text-gray-600">
            <span class="font-medium">描述：</span>
            <span v-html="props.room.desc || '暂无'"></span>
          </div>
        </div>
        <div
          class="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
          @click="editRoomDesc(props.room.id)"
        >
          <Pencil class="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <div class="flex gap-4 pb-2">
          <div
            v-for="hardware in props.room.hardwares"
            :key="hardware.id"
            class="group relative h-[120px] w-[120px] flex-shrink-0"
          >
            <div
              class="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <div
                class="cursor-pointer rounded-lg bg-white/90 p-1.5 shadow-sm hover:bg-red-50"
                @click="deleteHardware(hardware.id)"
              >
                <Trash2 class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <img
              v-if="hardware.image"
              :alt="hardware.name"
              :src="hardware.image"
              class="h-full w-full rounded-lg object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center rounded-lg bg-gray-100"
            >
              <span class="text-sm text-gray-500">{{ hardware.name }}</span>
            </div>
          </div>

          <Upload
            :before-upload="() => false"
            :show-upload-list="false"
            accept=".jpg, .jpeg, .png"
            @change="handleHardwareImageChange"
          >
            <div
              class="flex h-[120px] w-[120px] flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 hover:border-blue-400"
            >
              <Plus class="h-6 w-6 text-gray-400" />
              <div class="mt-2 text-sm text-gray-500">添加硬件</div>
            </div>
          </Upload>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto {
  scrollbar-color: #d1d5db transparent;
  scrollbar-width: thin;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}
</style>

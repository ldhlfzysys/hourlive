<script lang="ts" setup>
import type { Tag } from '#/types/IStreamer';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Input, message, Modal, Select, Upload } from 'ant-design-vue';
import { Plus } from 'lucide-vue-next';

import { useOSSFileStore, useStreamerStore } from '#/store';

import { countryOptions } from './country';

defineOptions({
  name: 'StreamerForm',
});

const ossFileStore = useOSSFileStore();

const streamerStore = useStreamerStore();

const handleAvatarChange = async (info) => {
  const isImage = info.file.type.startsWith('image/');
  const isLt1M = info.file.size / 1024 / 1024 < 10;

  if (!isImage) {
    message.error('文件格式不正确，请上传图片文件');
    return;
  }

  if (!isLt1M) {
    message.error('图片大小不能超过10MB');
    return;
  }

  try {
    const result = await ossFileStore.uploadAvatar(info.file);
    console.log('result', result);
    if (result && result.success) {
      streamerStore.streamerCreate.avatar = result.data;
      message.success('头像上传成功');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    message.error('头像上传失败');
  }
};

function handleOk() {
  if (streamerStore.streamerCreate.id) {
    streamerStore.updateStreamer();
  } else {
    streamerStore.createStreamer();
  }
}

function handleCancel() {
  streamerStore.showModal = false;
  streamerStore.isEditing = false;
}

const formattedTags = computed(() =>
  streamerStore.tags.map((tag) => ({
    color: tag.color,
    label: tag.name,
    value: tag.id,
  })),
);

const selectedTagIds = computed({
  get: () => streamerStore.streamerCreate.tags?.map((tag) => tag.id) || [],
  set: (newIds: number[]) => {
    streamerStore.streamerCreate.tags = newIds
      .map((id) => streamerStore.tags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => tag !== undefined);
  },
});
</script>

<template>
  <Modal
    v-model:visible="streamerStore.showModal"
    :confirm-loading="streamerStore.streamerCreateLoading"
    :title="streamerStore.isEditing ? $t('editmember') : $t('createmember')"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col px-4 py-5 sm:px-6">
        <!-- 头像上传 -->
        <div class="mb-3">
          <Upload
            :before-upload="() => false"
            :show-upload-list="false"
            accept=".jpg, .jpeg, .png"
            @change="handleAvatarChange"
          >
            <div
              class="inline-flex h-[100px] w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-300 hover:border-blue-400"
            >
              <img
                v-if="streamerStore.streamerCreate.avatar"
                :src="streamerStore.streamerCreate.avatar"
                alt="avatar"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex flex-col items-center">
                <Plus class="h-6 w-6 text-gray-400" />
                <div class="mt-2 text-sm text-gray-500">上传头像</div>
              </div>
            </div>
          </Upload>
        </div>

        <!-- 基本信息 -->
        <Input
          v-if="!streamerStore.isEditing"
          v-model:value="streamerStore.streamerCreate.account"
          :placeholder="$t('account')"
          autocomplete="new-username"
          class="mb-3"
        />
        <Input
          v-if="!streamerStore.isEditing"
          v-model:value="streamerStore.streamerCreate.password"
          :placeholder="$t('password')"
          autocomplete="new-password"
          class="mb-3"
          type="password"
        />
        <Input
          v-model:value="streamerStore.streamerCreate.name"
          :placeholder="$t('name')"
          class="mb-3"
        />

        <!-- 国家选择 -->
        <Select
          v-model:value="streamerStore.streamerCreate.country"
          class="mb-3"
          placeholder="选择国家"
        >
          <Select.Option
            v-for="country in countryOptions"
            :key="country.value"
            :value="country.value"
          >
            <span class="inline-flex items-center">
              <span class="mr-2">{{ country.flag }}</span>
              <span>{{ country.label }}</span>
            </span>
          </Select.Option>
        </Select>

        <!-- 描述 -->
        <Input.TextArea
          v-model:value="streamerStore.streamerCreate.desc"
          :rows="4"
          class="mb-3"
          placeholder="描述"
        />

        <!-- 标签选择 -->
        <Select
          v-model:value="selectedTagIds"
          :dropdown-style="{
            '--select-item-selected-bg': '#f5f5f5',
            '--select-item-selected-color': 'inherit',
          }"
          :options="formattedTags"
          class="custom-select mb-3"
          mode="multiple"
          placeholder="选择标签"
        >
          <template #option="{ label, color }">
            <span
              :style="{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: color || '#d9d9d9',
                color: color || '#666666',
                backgroundColor: color ? `${color}10` : 'transparent',
              }"
              class="inline-block rounded px-2 py-0.5"
            >
              {{ label }}
            </span>
          </template>
          <template #tagRender="{ label, closable, onClose, option }">
            <span
              :style="{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: option?.color || '#d9d9d9',
                color: option?.color || '#666666',
              }"
              class="mr-1 inline-flex items-center rounded px-2 py-0.5"
            >
              {{ label }}
              <span
                v-if="closable"
                class="ml-1 cursor-pointer"
                @click.stop="onClose"
              >
                ×
              </span>
            </span>
          </template>
        </Select>
      </div>
    </div>
  </Modal>
</template>

<style>
/* 注意：这里不使用 scoped，以确保样式可以正确应用 */
:where(.css-dev-only-do-not-override-17xkcni).ant-select-dropdown
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  font-weight: normal !important;
  color: rgb(0 0 0 / 88%) !important;
  background-color: #f5f5f5 !important;
}

:where(.css-dev-only-do-not-override-17xkcni).ant-select-dropdown
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: #f0f0f0 !important;
}

/* 确保下拉菜单背景色为白色 */
.ant-select-dropdown {
  background-color: #fff !important;
}

/* 覆盖选项的默认样式 */
.ant-select-item-option-content {
  color: inherit !important;
}

/* 覆盖选中和激活状态的样式 */
.ant-select-item-option-selected,
.ant-select-item-option-active {
  background-color: #f5f5f5 !important;
}
</style>

<style scoped>
.custom-select {
  width: 100%;
}
</style>

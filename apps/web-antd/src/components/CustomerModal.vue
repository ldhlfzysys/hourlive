<script lang="ts" setup>
import type { CustomerUpdate } from '#/types';

import { ref } from 'vue';

import { Input, message, Modal, Upload } from 'ant-design-vue';
import { Plus } from 'lucide-vue-next';

import { useOSSFileStore, useSchedulingStore } from '#/store';

defineOptions({
  name: 'CustomerModal',
});

const schedulingStore = useSchedulingStore();
const ossFileStore = useOSSFileStore();

const customerForm = ref<CustomerUpdate>({});

const loading = ref(false);

const handleAvatarChange = async (info) => {
  const isImage = info.file.type.startsWith('image/');
  const isLt10M = info.file.size / 1024 / 1024 < 10;

  if (!isImage) {
    message.error('请上传图片文件');
    return;
  }

  if (!isLt10M) {
    message.error('图片大小不能超过10MB');
    return;
  }

  try {
    const result = await ossFileStore.uploadAvatarOnly(info.file);
    if (result && result.success) {
      customerForm.value.avatar = result.data;
      message.success('头像上传成功');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    message.error('头像上传失败');
  }
};

const handleOk = async () => {
  if (!customerForm.value.brand) {
    message.error('请输入品牌名称');
    return;
  }

  try {
    loading.value = true;
    await schedulingStore.updateCustomer({
      ...customerForm.value,
    });
    message.success('创建成功');
    schedulingStore.customerModalVisible = false;
    customerForm.value = {};
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  schedulingStore.customerModalVisible = false;
  customerForm.value = {};
};
</script>

<template>
  <Modal
    v-model:open="schedulingStore.customerModalVisible"
    :confirm-loading="loading"
    title="新增品牌"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="flex flex-col space-y-4">
      <div class="flex justify-center">
        <Upload
          :before-upload="() => false"
          :show-upload-list="false"
          accept=".jpg,.jpeg,.png"
          @change="handleAvatarChange"
        >
          <div
            class="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border border-dashed border-gray-300 hover:border-blue-400"
          >
            <img
              v-if="customerForm.avatar"
              :src="customerForm.avatar"
              alt="avatar"
              class="h-full w-full rounded-full object-cover"
            />
            <template v-else>
              <Plus class="h-6 w-6 text-gray-400" />
              <span class="mt-1 text-sm text-gray-500">上传头像</span>
            </template>
          </div>
        </Upload>
      </div>

      <Input v-model:value="customerForm.brand" placeholder="品牌名称" />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import type { CustomerUpdate } from '#/types';

import { ref, watch } from 'vue';

import { Input, message, Modal, Upload } from 'ant-design-vue';
import { Plus } from 'lucide-vue-next';

import { useOSSFileStore, useSchedulingStore } from '#/store';

const schedulingStore = useSchedulingStore();
const ossFileStore = useOSSFileStore();
const customerForm = ref<CustomerUpdate>({});
const loading = ref(false);

// 监听编辑数据变化
watch(
  () => schedulingStore.editingCustomer,
  (newVal) => {
    customerForm.value = newVal ? { ...newVal } : {};
  },
  { immediate: true },
);

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
    await schedulingStore.updateCustomer(customerForm.value);
    message.success(customerForm.value.id ? '更新成功' : '添加成功');
    schedulingStore.closeCustomerModal();
    await schedulingStore.queryCustomers();
  } catch (error) {
    message.error(customerForm.value.id ? '更新失败' : '添加失败');
    console.error('操作失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  schedulingStore.closeCustomerModal();
};
</script>

<template>
  <Modal
    :confirm-loading="loading"
    :open="schedulingStore.customerModalVisible"
    :title="schedulingStore.editingCustomer ? '编辑品牌' : '新增品牌'"
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
            class="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-gray-300 hover:border-blue-400"
          >
            <img
              v-if="customerForm.avatar"
              :src="`${
                customerForm.avatar
              }?x-oss-process=image/resize,h_200,w_200,m_lfit`"
              alt="brand logo"
              class="max-h-full max-w-full object-contain"
            />
            <template v-else>
              <Plus class="h-6 w-6 text-gray-400" />
              <span class="mt-1 text-sm text-gray-500">上传品牌Logo</span>
            </template>
          </div>
        </Upload>
      </div>

      <Input v-model:value="customerForm.brand" placeholder="品牌名称" />
    </div>
  </Modal>
</template>

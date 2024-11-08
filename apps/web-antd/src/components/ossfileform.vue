<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, message, Modal, Space, Table, Upload } from 'ant-design-vue';
import { CloudUpload } from 'lucide-vue-next';

import { useOSSFileStore } from '#/store';

defineOptions({
  name: 'OSSFileForm',
});

const props = defineProps<{
  productId: number;
}>();

const emit = defineEmits(['update:visible']);

const ossFileStore = useOSSFileStore();
const fileList = ref<any[]>([]);
const uploading = computed(() => ossFileStore.uploading);
const fetching = computed(() => ossFileStore.fetching);
const removing = computed(() => ossFileStore.removing);

const userStore = useUserStore();
const canUpload = computed(() => {
  return userStore.userRoles.includes('customer');
});

const columns = [
  {
    dataIndex: 'name',
    key: 'name',
    title: '文件名',
  },
  {
    dataIndex: 'type',
    key: 'type',
    title: '文件类型',
  },
  {
    key: 'action',
    title: '操作',
    width: 200,
  },
];

const fileTableData = computed(() => {
  const files = ossFileStore.ossfiles.get(props.productId);
  if (!files) return [];

  return [...files.entries()].map(([name, path]) => ({
    name,
    path,
    type: name.split('.').pop()?.toUpperCase() || '',
  }));
});

const handleCancel = () => {
  emit('update:visible', false);
  fileList.value = [];
};

const beforeUpload = (file: File) => {
  fileList.value = [file];
  return false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
};

const handleUpload = async () => {
  const file = fileList.value[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    await ossFileStore.uploadFile({
      fileData: formData,
      product_id: props.productId,
    });
    fileList.value = [];
    await ossFileStore.fetchFile();
    message.success('上传成功');
  } catch {
    message.error('上传失败');
  }
};

const handleDownload = (record: any) => {
  window.open(record.path, '_blank');
};

const handleDelete = async (record: any) => {
  try {
    await ossFileStore.removeFile({
      name: record.name,
      product_id: props.productId,
    });
    await ossFileStore.fetchFile();
    message.success('删除成功');
  } catch {
    message.error('删除失败');
  }
};

onMounted(async () => {
  await ossFileStore.fetchFile();
});
</script>

<template>
  <Modal
    v-model:visible="ossFileStore.showModal"
    :title="$t('文件管理')"
    :width="700"
    @cancel="handleCancel"
  >
    <div v-if="canUpload" class="upload-container">
      <Upload.Dragger
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        :multiple="false"
        @drop="handleDrop"
      >
        <p class="ant-upload-drag-icon">
          <CloudUpload />
        </p>
        <p class="ant-upload-text">{{ $t('点击或拖拽文件到此区域上传') }}</p>
      </Upload.Dragger>

      <Button
        :disabled="fileList.length === 0"
        :loading="uploading"
        class="upload-button"
        type="primary"
        @click="handleUpload"
      >
        {{ $t('上传') }}
      </Button>
    </div>

    <Table
      :columns="columns"
      :data-source="fileTableData"
      :loading="fetching"
      :pagination="false"
      row-key="name"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Space>
            <Button type="link" @click="handleDownload(record)">
              {{ $t('下载') }}
            </Button>
            <Button
              v-if="canUpload"
              :loading="removing"
              danger
              type="link"
              @click="handleDelete(record)"
            >
              {{ $t('删除') }}
            </Button>
          </Space>
        </template>
      </template>
    </Table>
  </Modal>
</template>

<style scoped>
.upload-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.upload-button {
  align-self: center;
}
</style>

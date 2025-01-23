<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, message, Modal, Space, Table, Upload } from 'ant-design-vue';
import { CloudUpload } from 'lucide-vue-next';

import { useOSSFileStore } from '#/store';

defineOptions({
  name: 'OSSFileForm',
});

const props = withDefaults(
  defineProps<{
    allowEdit?: boolean;
  }>(),
  {
    allowEdit: false,
  },
);

const emit = defineEmits(['update:visible']);

const ossFileStore = useOSSFileStore();
const fileList = ref<any[]>([]);
const uploading = computed(() => ossFileStore.uploading);
const fetching = computed(() => ossFileStore.fetching);
const removing = computed(() => ossFileStore.removing);

const userStore = useUserStore();
const canUpload = computed(() => {
  return (
    userStore.userRoles.includes('customer') ||
    userStore.userRoles.includes('super')
  );
});

const columns = [
  {
    customRender: ({ record, text }: { record: any; text: string }) => {
      const cleanPath = record.path.split('?')[0];
      return h('a', { href: cleanPath, target: '_blank' }, text);
    },
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
  const files = ossFileStore.ossfiles[ossFileStore.currentProductId];
  if (!files) return [];

  return Object.entries(files).map(([name, path]) => ({
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
  fileList.value = [...fileList.value, file];
  return false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
};

const handleUpload = async () => {
  if (fileList.value.length === 0) return;
  for (const file of fileList.value) {
    const formData = new FormData();
    formData.append('file', file.originFileObj);

    await ossFileStore.uploadFile({
      fileData: formData,
      product_id: ossFileStore.currentProductId,
    });
  }

  fileList.value = [];
  await ossFileStore.fetchFile();
};

const handleDownload = (record: any) => {
  window.open(record.path, '_blank');
};

const handleDelete = async (record: any) => {
  try {
    await ossFileStore.removeFile({
      name: record.name,
      product_id: ossFileStore.currentProductId,
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
    :footer="null"
    :title="$t('scripfile')"
    :width="700"
    @cancel="handleCancel"
  >
    <div v-if="canUpload && allowEdit" class="mb-6 flex items-center gap-4">
      <Upload.Dragger
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        :multiple="true"
        class="flex-1"
        @drop="handleDrop"
      >
        <div class="flex h-40 flex-col items-center justify-center">
          <p class="ant-upload-drag-icon">
            <CloudUpload class="text-5xl text-blue-400" />
          </p>
          <p class="mt-2 text-gray-500">
            {{ $t('点击或拖拽文件到此区域上传') }}
          </p>
        </div>
      </Upload.Dragger>

      <Button
        :disabled="fileList.length === 0"
        :loading="uploading"
        class="min-w-[80px] self-center"
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

<script lang="ts" setup>
import type { Sample } from '#/types';

import { $t } from '@vben/locales';

import { Modal } from 'ant-design-vue';

import SampleCard from '#/components/samplecard.vue';

defineOptions({
  name: 'SampleList',
});

// 定义props
const props = defineProps<{
  open: boolean;
  samples: Sample[];
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

// 处理Modal关闭
function handleCancel() {
  emit('update:open', false);
}
</script>

<template>
  <Modal
    :footer="null"
    :open="props.open"
    :title="$t('samplelist')"
    centered
    width="90%"
    @cancel="handleCancel"
  >
    <div class="sample-list-container">
      <div class="grid grid-cols-2 gap-2">
        <template v-for="sample in props.samples" :key="sample.id">
          <SampleCard :sample="sample" />
        </template>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.sample-list-container {
  max-height: 70vh;
  padding: 10px;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>

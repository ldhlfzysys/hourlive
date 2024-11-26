<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

import { $t } from '@vben/locales';

import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { Modal } from 'ant-design-vue'; // 引入 css

import { useSampleStore } from '#/store';

import '@wangeditor/editor/dist/css/style.css';

defineOptions({
  name: 'SampleKspForm',
});

const props = withDefaults(
  defineProps<{
    allowEdit?: boolean;
  }>(),
  {
    allowEdit: false,
  },
);

const editorRef = ref();
const mode = ref('simple');

const toolbarConfig = {
  toolbarKeys: ['bold', 'headerSelect', 'color'],
};
const editorConfig = { placeholder: '请输入内容...' };

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

const sampleStore = useSampleStore();

const handleOk = () => {
  sampleStore.updateSample();
};
</script>

<template>
  <Modal
    v-model:visible="sampleStore.showKSPModal"
    :confirm-loading="sampleStore.sampleUpdateLoading"
    :footer="allowEdit ? undefined : null"
    :title="$t('product_ksp')"
    centered
    width="800px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div style="border: 1px solid #ccc">
        <Toolbar
          :default-config="toolbarConfig"
          :editor="editorRef"
          :mode="mode"
          style="border-bottom: 1px solid #ccc"
        />
        <Editor
          v-model="sampleStore.sampleUpdate.product_ksp"
          :default-config="editorConfig"
          :mode="mode"
          style="height: 500px; overflow-y: hidden"
          @on-created="handleCreated"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.product-image {
  width: 100%;
  height: auto;
}

.product-info {
  margin-top: 10px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.middle-content {
  font-size: 16px;
  word-break: break-word;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

::-webkit-scrollbar {
  width: 0;
  height: 7px;
  background-color: #f5f5f5;
}

/* 定义滚动条轨道 内阴影+圆角 */
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 30%);
}

/* 定义滑块 内阴影+圆角 */
::-webkit-scrollbar-thumb {
  background-color: #c8c8c8;
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgb(0 0 0 / 10%);
}
</style>

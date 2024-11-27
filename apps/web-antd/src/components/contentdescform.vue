<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

import { $t } from '@vben/locales';

import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { Modal } from 'ant-design-vue';

import { useContentStore } from '#/store';

import '@wangeditor/editor/dist/css/style.css';

defineOptions({
  name: 'ContentDescForm',
});

withDefaults(
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

onBeforeUnmount(() => {
  // 组件销毁时，也及时销毁编辑器
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例
};

const contentStore = useContentStore();

const handleOk = () => {
  contentStore.updateContent();
};
</script>

<template>
  <Modal
    v-model:open="contentStore.showDescModal"
    :confirm-loading="contentStore.contentCreateLoading"
    :footer="allowEdit ? undefined : null"
    :title="$t('save')"
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
          v-model="contentStore.contentCreate.content_desc"
          :default-config="editorConfig"
          :mode="mode"
          style="height: 500px; overflow-y: hidden"
          @on-created="handleCreated"
        />
      </div>
    </div>
  </Modal>
</template>

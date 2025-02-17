<script lang="ts" setup>
import { ref } from 'vue';

import { Button, Divider, Modal, Spin, Textarea } from 'ant-design-vue';
import Tesseract from 'tesseract.js';

import { useSchedulingStore } from '#/store';

defineOptions({
  name: 'AISchedulingModal',
});

const schedulingStore = useSchedulingStore();
const ocrResultMap = ref({});
const isLoading = ref(false);

// Function to handle file upload and perform OCR
const scriptToLangMap = {
  Arabic: 'eng',
  Han: 'chi_sim',
  Latin: 'eng',
  // 添加其他需要的映射
};

const handleUpload = (options: any) => {
  const { file } = options;

  if (file instanceof File && file.type.startsWith('image/')) {
    isLoading.value = true;
    console.log('Image file uploaded:', file);
    // Detect language before performing OCR
    Tesseract.detect(file)
      .then(({ data: { script } }) => {
        const lang = scriptToLangMap[script as keyof typeof scriptToLangMap];
        // 使用检测到的脚本作为语言参数
        return Tesseract.recognize(
          file,
          lang, // 使用检测到的语言
          {
            logger: (m) => console.log(m), // Log progress
          },
        );
      })
      .then(({ data: { text } }: { data: { text: string } }) => {
        console.log('OCR Result:', text);
        ocrResultMap.value = { ...ocrResultMap.value, [file.name]: text };
        isLoading.value = false;
      })
      .catch((error: Error) => {
        console.error('OCR Error:', error);
        isLoading.value = false;
      });
  } else {
    console.log('Non-image file uploaded:', file);
  }
};
</script>

<template>
  <Modal
    v-model:open="schedulingStore.showAISchedulingModal"
    style="top: 5%; width: 60%"
    @ok="schedulingStore.addEventsToCalendar()"
  >
    <Spin :spinning="isLoading" tip="正在解析中...">
      <Divider orientation="left">AI排班</Divider>
      <!-- <Upload
        :custom-request="handleUpload"
        :max-count="1"
        :show-upload-list="false"
        accept="image/*"
      >
        <button class="dashed-button">+ 请选择文件进行解析</button>
      </Upload> -->

      <!-- <div
        v-if="Object.keys(ocrResultMap).length > 0"
        class="mt-4 max-h-[40%] overflow-y-auto"
      >
        <Collapse>
          <CollapsePanel
            v-for="(item, key) in ocrResultMap"
            :key="key"
            :accordion="true"
            :header="`${key} 解析结果`"
          >
            <template #extra>
              <Button
                ghost
                size="small"
                type="primary"
                @click="handleRemoveFromScheduling(key)"
              >
                移除
              </Button>
              <Button
                class="ml-2"
                ghost
                size="small"
                type="primary"
                @click="handleAddToScheduling(key)"
              >
                添加
              </Button>
            </template>
            <p>{{ item }}</p>
          </CollapsePanel>
        </Collapse>
      </div> -->

      <div class="mt-2 flex h-full flex-1 flex-row items-center space-x-2">
        <label class="w-[12%]">输入排班信息</label>
        <Textarea v-model:value="schedulingStore.inputValue" class="w-[75%]" />
        <Button type="primary" @click="schedulingStore.handleAIScheduling()">
          AI生成
        </Button>
      </div>

      <div
        v-if="schedulingStore.schedulingResult"
        class="mt-2 flex h-full flex-1 flex-row items-center space-x-2"
      >
        <label class="w-[12%]">AI排班结果</label>
        <Textarea
          v-model:value="schedulingStore.schedulingResult"
          class="h-auto w-[75%]"
          size="large"
          style="height: 300px; max-height: 500px"
        />
      </div>
    </Spin>
  </Modal>
</template>

<style scoped>
.dashed-button {
  padding: 8px 16px; /* 添加一些内边距 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  border: 1px dashed #000; /* 添加虚线边框 */
}
</style>

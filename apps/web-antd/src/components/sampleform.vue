<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

import { $t } from '@vben/locales';

import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import {
  Button,
  Image,
  Input,
  Modal,
  Select,
  SelectOption,
} from 'ant-design-vue';

import { useSampleStore } from '#/store';

import '@wangeditor/editor/dist/css/style.css';

defineOptions({
  name: 'SampleForm',
});

const sampleStore = useSampleStore();

const editorRef = ref();
const mode = ref('simple');

const toolbarConfig = {
  toolbarKeys: ['bold', 'headerSelect', 'color'],
};
const editorConfig = { placeholder: '请输入内容...' };

onBeforeUnmount(() => {});

const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

function handleOk() {
  if (sampleStore.sampleUpdate.id) {
    sampleStore.updateSample();
  } else {
    sampleStore.createSample();
  }
}
</script>

<template>
  <Modal
    v-model:open="sampleStore.showModal"
    :confirm-loading="sampleStore.sampleUpdateLoading"
    :ok-text="sampleStore.sampleUpdate.id ? $t('save') : $t('create')"
    :title="sampleStore.sampleUpdate.id ? $t('edit') : $t('create')"
    centered
    width="800px"
    @ok="handleOk"
  >
    <div class="flex flex-col">
      <div class="flex w-full">
        <Input
          v-model:value="sampleStore.sampleUpdate.product_link"
          :placeholder="$t('enterproductlink')"
          class="mr-3 text-lg font-medium leading-6 text-gray-900"
        />
        <Button
          :loading="sampleStore.sampleFetchLoading"
          type="primary"
          @click="sampleStore.fetechProductInfo()"
        >
          {{ sampleStore.sampleUpdate.id ? $t('update') : $t('fetch') }}
        </Button>
      </div>
      <div class="flex h-[200px] w-full">
        <div class="m-2 flex flex-1 rounded-lg bg-white shadow-md">
          <!-- 图片区域 -->
          <div class="relative w-[184px]">
            <Image
              :src="
                sampleStore.sampleUpdate.product_image ??
                'https://www.antdv.com/#error'
              "
              alt="商品图片"
              class="rounded-lg"
            />
          </div>

          <!-- 商品信息区域 -->
          <div class="flex-1 pl-4">
            <!-- 商品标题 -->
            <Input
              v-model:value="sampleStore.sampleUpdate.product_name"
              :placeholder="$t('product_name')"
              class="mr-3 text-lg font-medium leading-6 text-gray-900"
            />

            <!-- 商品 ID 和操作链接 -->
            <div class="mt-2 flex items-center space-x-3 text-sm text-gray-500">
              <Input
                v-model:value="sampleStore.sampleUpdate.product_id"
                :placeholder="$t('product_id')"
                class="mr-3 text-lg font-medium leading-6 text-gray-900"
              />
            </div>

            <!-- 价格和折扣 -->
            <div class="mt-4 flex flex-row">
              <Input
                v-model:value="sampleStore.sampleUpdate.product_final_price"
                :placeholder="$t('product_final_price')"
                class="mr-3 text-base leading-6 text-blue-600"
              />
              <Input
                v-model:value="sampleStore.sampleUpdate.product_srp"
                :placeholder="$t('product_srp')"
                class="mr-3 text-sm leading-6 text-gray-400 line-through"
              />
              <Input
                v-model:value="sampleStore.sampleUpdate.product_discount"
                :placeholder="$t('product_discount')"
                class="mr-3 text-sm leading-6 text-red-600"
              />
            </div>
            <div class="mt-2 flex">
              <Select
                v-model:value="sampleStore.sampleUpdate.is_main"
                class="w-[150px]"
              >
                <SelectOption value="0">
                  {{ $t('sample_welfare') }}
                </SelectOption>
                <SelectOption value="1">{{ $t('sample_main') }}</SelectOption>
                <SelectOption value="2">
                  {{ $t('sample_deal') }}
                </SelectOption>
                <SelectOption value="3">
                  {{ $t('sample_normal') }}
                </SelectOption>
                <SelectOption value="4">
                  {{ $t('sample_new') }}
                </SelectOption>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4">
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
            style="height: 200px; overflow-y: hidden"
            @on-created="handleCreated"
          />
        </div>
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

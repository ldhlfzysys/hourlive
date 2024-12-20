<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  Button,
  Image,
  Input,
  Modal,
  Select,
  SelectOption,
} from 'ant-design-vue';

import { useSampleStore } from '#/store';

defineOptions({
  name: 'SampleForm',
});

const sampleStore = useSampleStore();
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
              fallback="data:image/png;base64,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"
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
                class="w-[100px]"
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

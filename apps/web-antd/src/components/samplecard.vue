<script lang="ts" setup>
import type { Sample } from '#/types';

import { computed } from 'vue';

import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Image } from 'ant-design-vue';

import { useSampleStore } from '#/store';

defineOptions({
  name: 'SampleCard',
});

const props = defineProps<{
  sample: Sample;
}>();

const sampleStore = useSampleStore();
const userStore = useUserStore();

const type = computed(() => {
  switch (props.sample.is_main) {
    case '1': {
      return 'sample_main';
    }
    case '0': {
      return 'sample_welfare';
    }
    case '2': {
      return 'sample_deal';
    }
    default: {
      return '';
    }
  }
});

const canEdit = computed(() => {
  return userStore.userRoles.includes('customer');
});
</script>

<template>
  <div class="flex h-[200px] w-full">
    <div
      class="m-2 flex w-full rounded-lg border bg-white shadow-md hover:shadow-lg"
    >
      <!-- 图片区域 -->
      <div class="relative w-[180px]">
        <Image
          :src="props.sample.product_image"
          alt="商品图片"
          class="rounded-lg"
        />
        <div
          class="absolute right-2 top-2 rounded-full bg-gray-500 px-2 py-1 text-sm text-white"
        >
          {{ $t(type) }}
        </div>
      </div>

      <!-- 商品信息区域 -->
      <div class="w-2/3 pl-4">
        <!-- 商品标题 -->
        <h2 class="line-clamp-2 text-lg font-semibold text-gray-800">
          {{ props.sample.product_name }}
        </h2>

        <!-- 商品 ID 和操作链接 -->
        <div class="mt-2 flex items-center space-x-3 text-sm text-gray-500">
          <span>ID: 1730933517007210531</span>
          <a class="text-blue-500" href="#">{{ $t('scriptmanager') }}</a>
          <a
            class="text-blue-500"
            href="#"
            @click="sampleStore.makeKSPUpdate(props.sample.id!)"
            >{{ $t('product_ksp') }}</a
          >
        </div>

        <!-- 价格和折扣 -->
        <div class="mt-4 line-clamp-1">
          <span class="text-base font-bold text-blue-600">{{
            props.sample.product_final_price
          }}</span>
          <span class="ml-2 text-sm text-gray-400 line-through">{{
            props.sample.product_srp
          }}</span>
          <span class="ml-2 text-sm text-red-500">{{
            props.sample.product_discount
          }}</span>
        </div>

        <!-- 编辑按钮 -->
        <div v-if="canEdit" class="mt-4">
          <button
            class="bg-primary rounded-full px-4 py-1 text-sm text-white"
            @click="sampleStore.makeUpdate(props.sample.id!)"
          >
            {{ $t('edit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
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

<script lang="ts" setup>
import { useAccess } from '@vben/access';
import { $t } from '@vben/locales';

import { Input, Modal, Select, SelectOption } from 'ant-design-vue';

import { useContentStore, useLiveAccountStore } from '#/store';

defineOptions({
  name: 'ContentForm',
});
const { hasAccessByRoles } = useAccess();
const contentStore = useContentStore();
const liveaccountStore = useLiveAccountStore();

function handleOk() {
  if (contentStore.contentCreate.id) {
    contentStore.updateContent();
  } else {
    contentStore.createContent();
  }
}
</script>

<template>
  <Modal
    v-model:open="contentStore.showModal"
    :confirm-loading="contentStore.contentCreateLoading"
    :footer="hasAccessByRoles(['customer']) ? undefined : null"
    :title="$t('create')"
    centered
    width="800px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-col gap-4 p-6">
        <!-- 内容文本 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            {{ $t('content_text') }}
          </span>
          <Input
            v-model:value="contentStore.contentCreate.content_text"
            class="flex-1"
          />
        </div>

        <!-- 选择直播账号 -->
        <div class="flex flex-row items-center">
          <span class="mr-2 w-24 text-sm font-medium text-gray-500">
            {{ $t('live_account') }}
          </span>
          <Select
            v-model:value="contentStore.contentCreate.liveaccount_id"
            class="flex-1"
          >
            <SelectOption
              v-for="account in liveaccountStore.liveaccountList"
              :key="account.id"
              :value="account.id"
            >
              {{ account.name }}
            </SelectOption>
          </Select>
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

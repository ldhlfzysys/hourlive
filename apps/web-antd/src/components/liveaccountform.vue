<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Input, Modal, Select, SelectOption } from 'ant-design-vue';

import { useLiveAccountStore } from '#/store';

defineOptions({
  name: 'LiveAccountForm',
});

const liveaccountStore = useLiveAccountStore();

function handleOk() {
  if (liveaccountStore.liveaccountCreate.id) {
    liveaccountStore.updateLiveAccount();
  } else {
    liveaccountStore.createLiveAccount();
  }
}
</script>

<template>
  <Modal
    v-model:open="liveaccountStore.showModal"
    :confirm-loading="liveaccountStore.liveaccountCreateLoading"
    :title="$t('create')"
    centered
    width="800px"
    @ok="handleOk"
  >
    <div class="overflow-hidden rounded-lg border bg-white shadow">
      <div class="flex flex-row px-4 py-5 sm:px-6">
        <Input
          v-model:value="liveaccountStore.liveaccountCreate.name"
          :placeholder="$t('shop_name')"
          class="mr-3 text-lg font-medium leading-6 text-gray-900"
        />
        <Input
          v-model:value="liveaccountStore.liveaccountCreate.code"
          :placeholder="$t('shop_code')"
          class="mt-1 max-w-2xl text-sm text-gray-500"
        />
      </div>
      <div class="flex flex-row justify-between">
        <div class="flex w-full flex-col border-t border-gray-200 px-4 py-5">
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('live_account') }}
            </span>
            <Input
              v-model:value="liveaccountStore.liveaccountCreate.live_account"
              autocomplete="new-username"
              class="flex-1 text-sm text-gray-900"
            />
          </div>
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('live_uid') }}
            </span>
            <Input
              v-model:value="liveaccountStore.liveaccountCreate.live_uid"
              class="flex-1 text-sm text-gray-900"
            />
            <Select
              v-model:value="liveaccountStore.liveaccountCreate.platform"
              class="ml-3 w-[160px]"
            >
              <SelectOption value="TikTok">TikTok</SelectOption>
              <SelectOption value="Shopee">Shopee</SelectOption>
            </Select>
          </div>
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('platform_name') }}
            </span>
            <Input
              v-model:value="
                liveaccountStore.liveaccountCreate.platform_account
              "
              autocomplete="new-username"
              class="flex-1 text-sm text-gray-900"
            />
          </div>
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('livephone') }}
            </span>
            <Input
              v-model:value="liveaccountStore.liveaccountCreate.mobile"
              :placeholder="$t('phoneoremail')"
              class="flex-1 text-sm text-gray-900"
            />
          </div>
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('liveemail') }}
            </span>
            <Input
              v-model:value="liveaccountStore.liveaccountCreate.email"
              :placeholder="$t('phoneoremail')"
              class="flex-1 text-sm text-gray-900"
            />
          </div>
          <div class="mb-5 flex flex-row items-center">
            <span
              class="flex w-[160px] justify-end pr-3 text-sm font-medium text-gray-500"
            >
              {{ $t('livepassword') }}
            </span>
            <Input.Password
              v-model:value="liveaccountStore.liveaccountCreate.password"
              autocomplete="new-password"
              class="flex-1 text-sm text-gray-900"
            />
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

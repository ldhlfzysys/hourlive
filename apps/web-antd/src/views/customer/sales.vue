<script lang="ts" setup>
import type { OrderQuery } from '#/types';

import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { RadioButton, RadioGroup } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import HourLivePackageGrid from '#/components/hourlivepackageGrid.vue';
import {
  useContentStore,
  useHourLivePackageStore,
  useLiveAccountStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

const store = useHourLivePackageStore();
const liveaccountStore = useLiveAccountStore();
const userStore = useUserStore();
const contentStore = useContentStore();
const tab = ref('all');

const packages = computed(() => {
  if (tab.value === 'all') {
    return store.listedPackages;
  }
  return store.minePackages;
});

onMounted(() => {
  fetchPackages();
  liveaccountStore.queryLiveAccount();
});

function fetchPackages() {
  if (tab.value === 'all') {
    store.queryPackages();
  } else {
    const params: OrderQuery = {
      customer_id: userStore.userInfo!.userId,
    };
    store.queryPackages(params);
  }
}

function handleRadioChange(value: string) {
  fetchPackages();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex flex-col space-y-6">
        <div class="flex justify-center">
          <RadioGroup
            v-model:value="tab"
            :style="{ marginBottom: '8px' }"
            @change="handleRadioChange"
          >
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="mine">我的</RadioButton>
          </RadioGroup>
        </div>
        <div v-if="packages.length > 0">
          <HourLivePackageGrid :packages="packages" />
        </div>
        <div v-else>
          <Empty :loading="store.packageQueryLoading" description="暂无数据" />
        </div>
      </div>
    </template>

    <template #footer></template>

    <!-- 添加表单组件 -->
  </HourLivePage>
</template>

<style scoped></style>

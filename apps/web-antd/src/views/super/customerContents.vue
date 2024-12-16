<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Select, Tabs } from 'ant-design-vue';
import { Package, Truck, TvMinimalPlay, UserRound } from 'lucide-vue-next';

import Empty from '#/components/empty.vue';
import {
  useContentStore,
  useCustomerStore,
  useLiveAccountStore,
  useSampleShippingStore,
  useSampleStore,
} from '#/store';
import ContentList from '#/views/customer/content.vue';
import LiveAccountList from '#/views/customer/liveaccount.vue';
import SampleList from '#/views/customer/sample.vue';
import ShippingList from '#/views/customer/shippings.vue';
import HourLivePage from '#/views/template/common.vue';

const customerStore = useCustomerStore();
const selectedCustomer = ref<number>();
const activeTab = ref('sample');

const sampleStore = useSampleStore();
const contentStore = useContentStore();
const liveAccountStore = useLiveAccountStore();
const shippingStore = useSampleShippingStore();

// 获取商家列表
onMounted(async () => {
  await customerStore.fetchAllCustomers();
});

// 监听商家选择变化
watch(selectedCustomer, (newVal) => {
  // 重置所有 store 的查询条件
  sampleStore.$reset();
  contentStore.$reset();
  liveAccountStore.$reset();
  shippingStore.$reset();

  // 设置新的客户 ID
  if (newVal) {
    sampleStore.sampleQuery.customer_id = newVal;
    contentStore.contentQuery.customer_id = newVal;
    liveAccountStore.liveaccountQuery.customer_id = newVal;
    shippingStore.sampleShippingQuery.customer_id = newVal;

    // 获取客户详情
    customerStore.customerById(newVal);

    // 根据当前激活的标签页加载数据
    loadActiveTabData();
  }
});

// 监听标签页切换
watch(activeTab, () => {
  if (selectedCustomer.value) {
    loadActiveTabData();
  }
});

// 加载当前激活标签页的数据
function loadActiveTabData() {
  switch (activeTab.value) {
    case 'sample': {
      sampleStore.querySample();
      break;
    }
    case 'content': {
      contentStore.queryContent();
      break;
    }
    case 'liveaccount': {
      liveAccountStore.queryLiveAccount();
      break;
    }
    case 'shipping': {
      shippingStore.querySampleShipping();
      break;
    }
  }
}

const tabs = [
  {
    icon: Package,
    key: 'sample',
    label: $t('sample'),
  },
  {
    icon: UserRound,
    key: 'liveaccount',
    label: $t('liveaccount'),
  },
  {
    icon: TvMinimalPlay,
    key: 'content',
    label: $t('content'),
  },
  {
    icon: Truck,
    key: 'shipping',
    label: $t('agency_shippings'),
  },
];
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div class="flex items-center gap-4">
        <Select
          v-model:value="selectedCustomer"
          :filter-option="
            (input, option) =>
              option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          "
          :options="customerStore.customerOptions"
          :placeholder="$t('select_customer')"
          class="w-64"
          show-search
        />
      </div>
    </template>

    <template #content>
      <div v-if="selectedCustomer" class="flex h-full flex-col">
        <Tabs v-model:active-key="activeTab" class="flex-1">
          <template #tabBarExtraContent>
            <div class="mr-4">
              {{ customerStore.customerById(selectedCustomer)?.name }}
            </div>
          </template>

          <Tabs.TabPane v-for="tab in tabs" :key="tab.key" class="h-full">
            <template #tab>
              <span class="flex items-center gap-2">
                <component :is="tab.icon" class="h-4 w-4" />
                {{ tab.label }}
              </span>
            </template>

            <div class="h-full">
              <component
                :is="
                  {
                    sample: SampleList,
                    liveaccount: LiveAccountList,
                    content: ContentList,
                    shipping: ShippingList,
                  }[tab.key]
                "
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
      <Empty v-else :description="$t('select_customer')" class="flex-1" />
    </template>
  </HourLivePage>
</template>

<style scoped>
:deep(.ant-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.ant-tabs-content) {
  flex: 1;
  height: 100%;
}

:deep(.ant-tabs-tabpane) {
  height: 100%;
}
</style>

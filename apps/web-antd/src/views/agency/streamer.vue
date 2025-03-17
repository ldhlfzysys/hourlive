<script lang="ts" setup>
import type { CustomerUpdate } from '#/types';

import { onMounted, ref } from 'vue';

import { Button } from 'ant-design-vue';

import CustomerCard from '#/components/customercard.vue';
import CustomerModal from '#/components/CustomerModal.vue';
import Empty from '#/components/empty.vue';
import StreamerCard from '#/components/streamercard.vue';
import StreamerForm from '#/components/streamerform.vue';
import { useSchedulingStore, useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

const streamerStore = useStreamerStore();
const schedulingStore = useSchedulingStore();

const editingCustomer = ref<CustomerUpdate>();

const handleEditCustomer = (customer: CustomerUpdate) => {
  editingCustomer.value = customer;
  schedulingStore.customerModalVisible = true;
};

onMounted(() => {
  streamerStore.queryStreamer();
  schedulingStore.queryCustomers();
});
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #content>
      <div class="flex h-full gap-8">
        <!-- 左侧主播管理 -->
        <div class="flex w-1/2 flex-col">
          <div class="mb-6 flex items-center">
            <h2 class="flex-1 text-xl font-semibold">主播管理</h2>
            <Button
              size="large"
              type="primary"
              @click="streamerStore.makeCreate()"
            >
              {{ $t('add_streamer') }}
            </Button>
          </div>

          <div class="flex flex-1 flex-col">
            <div v-if="streamerStore.streamerList.length > 0" class="scroller">
              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="item in streamerStore.streamerList"
                  :key="item.id"
                  class="hover:scale-102 transition-transform"
                >
                  <StreamerCard :streamer="item" />
                </div>
              </div>
            </div>
            <Empty
              v-else
              :loading="streamerStore.streamerLoading"
              class="flex-1"
              description="暂无主播数据，点击上方按钮添加"
            />
          </div>
          <StreamerForm />
        </div>

        <!-- 分隔线 -->
        <div class="h-full w-px bg-gray-200"></div>

        <!-- 右侧品牌管理 -->
        <div class="flex w-1/2 flex-col">
          <div class="mb-6 flex items-center">
            <h2 class="flex-1 text-xl font-semibold">品牌管理</h2>
            <Button
              size="large"
              type="primary"
              @click="schedulingStore.customerModalVisible = true"
            >
              添加品牌
            </Button>
          </div>

          <div class="flex flex-1 flex-col">
            <div
              v-if="schedulingStore.customerList.length > 0"
              class="scroller"
            >
              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="item in schedulingStore.customerList"
                  :key="item.id"
                  class="hover:scale-102 transition-transform"
                >
                  <CustomerCard
                    :customer="item"
                    @click="handleEditCustomer(item)"
                  />
                </div>
              </div>
            </div>
            <Empty
              v-else
              :loading="schedulingStore.customerQueryLoading"
              class="flex-1"
              description="暂无品牌数据，点击上方按钮添加"
            />
          </div>
          <CustomerModal :edit-customer="editingCustomer" />
        </div>
      </div>
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
}
</style>

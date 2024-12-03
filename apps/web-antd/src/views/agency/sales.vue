<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Button, Checkbox } from 'ant-design-vue';

import HourLivePackageCard from '#/components/hourlivepackagecard.vue';
import HourLivePackageForm from '#/components/hourlivepackageform.vue';
import {
  useHourLivePackageStore,
  useRoomStore,
  useStreamerStore,
} from '#/store';
import HourLivePage from '#/views/template/common.vue';

const store = useHourLivePackageStore();
const roomStore = useRoomStore();
const streamerStore = useStreamerStore();

// 未出售分组的状态选择
const unsoldStatusChecked = ref([4, 5]); // 默认选中4和5
// 已售出分组的状态选择
const soldStatusChecked = ref([6, 7]);

// 未出售的包
const unsoldPackages = computed(() => {
  return store.packageList.filter((pkg) =>
    unsoldStatusChecked.value.includes(pkg.status),
  );
});

// 已售出的包
const soldPackages = computed(() => {
  return store.packageList.filter((pkg) =>
    soldStatusChecked.value.includes(pkg.status),
  );
});

// 已拒绝的包
const rejectedPackages = computed(() =>
  store.packageList.filter((pkg) => pkg.status === 8),
);

onMounted(() => {
  store.queryPackages();
  roomStore.queryRoom();
  streamerStore.queryStreamer();
});
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div class="flex items-center justify-between">
        <div></div>
        <Button type="primary" @click="store.showModal = true">新增包场</Button>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col space-y-6">
        <!-- 未出售分组 -->
        <div class="package-group">
          <div class="mb-4 flex items-center">
            <h3 class="mr-4">未出售</h3>
            <Checkbox.Group v-model:value="unsoldStatusChecked">
              <Checkbox :value="4">未上架</Checkbox>
              <Checkbox :value="5">已上架</Checkbox>
            </Checkbox.Group>
          </div>
          <div
            v-if="unsoldPackages.length > 0"
            class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4"
          >
            <HourLivePackageCard
              v-for="item in unsoldPackages"
              :key="item.id"
              :item="item"
            />
          </div>
          <div v-else class="text-gray-500">暂无数据</div>
        </div>

        <!-- 已售出分组 -->
        <div class="package-group">
          <div class="mb-4 flex items-center">
            <h3 class="mr-4">已售出</h3>
            <Checkbox.Group v-model:value="soldStatusChecked">
              <Checkbox :value="6">待确认</Checkbox>
              <Checkbox :value="7">已确认</Checkbox>
            </Checkbox.Group>
          </div>
          <div
            v-if="soldPackages.length > 0"
            class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4"
          >
            <HourLivePackageCard
              v-for="item in soldPackages"
              :key="item.id"
              :item="item"
            />
          </div>
          <div v-else class="text-gray-500">暂无数据</div>
        </div>

        <!-- 已拒绝分组 -->
        <div class="package-group">
          <h3 class="mb-4">已拒绝</h3>
          <div
            v-if="rejectedPackages.length > 0"
            class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4"
          >
            <HourLivePackageCard
              v-for="item in rejectedPackages"
              :key="item.id"
              :item="item"
            />
          </div>
          <div v-else class="text-gray-500">暂无数据</div>
        </div>
      </div>
      <HourLivePackageForm />
    </template>

    <template #footer></template>

    <!-- 添加表单组件 -->
  </HourLivePage>
</template>

<style scoped>
.package-group {
  @apply border-b border-gray-200 pb-6;
}

.package-group:last-child {
  @apply border-b-0;
}

h3 {
  @apply text-lg font-medium;
}
</style>

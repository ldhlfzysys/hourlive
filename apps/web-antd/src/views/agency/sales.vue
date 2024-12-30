<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Button, Checkbox, TabPane, Tabs } from 'ant-design-vue';

import HourLivePackageForm from '#/components/hourlivepackageform.vue';
import HourLivePackageGrid from '#/components/hourlivepackageGrid.vue';
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
    <template #header> </template>

    <template #content>
      <div class="flex flex-col space-y-6">
        <Tabs :tab-bar-gutter="50" size="large" tab-position="left">
          <template #leftExtra>
            <div class="mb-6 flex items-center justify-between">
              <div></div>
              <Button type="primary" @click="store.showModal = true">
                新增包场
              </Button>
            </div>
          </template>
          <TabPane key="1" tab="未出售">
            <div class="package-group">
              <div class="mb-4 flex items-center">
                <Checkbox.Group v-model:value="unsoldStatusChecked">
                  <Checkbox :value="4">未上架</Checkbox>
                  <Checkbox :value="5">已上架</Checkbox>
                </Checkbox.Group>
              </div>
              <HourLivePackageGrid :packages="unsoldPackages" />
            </div>
          </TabPane>
          <TabPane key="2" tab="已售出">
            <div class="package-group">
              <div class="mb-4 flex items-center">
                <Checkbox.Group v-model:value="soldStatusChecked">
                  <Checkbox :value="6">待确认</Checkbox>
                  <Checkbox :value="7">已确认</Checkbox>
                </Checkbox.Group>
              </div>
              <HourLivePackageGrid :packages="soldPackages" />
            </div>
          </TabPane>
          <TabPane key="3" tab="已拒绝">
            <div class="package-group">
              <HourLivePackageGrid :packages="rejectedPackages" />
            </div>
          </TabPane>
        </Tabs>
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

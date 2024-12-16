<script lang="ts" setup>
import type { TimeslotOrder } from '#/types';

import { ref } from 'vue';

import {} from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import HourLivePackageCard from '#/components/hourlivepackagecard.vue';
import { useHourLivePackageStore } from '#/store';
import { useRoomStore } from '#/store/room';
import { useStreamerStore } from '#/store/streamer';

defineOptions({
  name: 'HourLivePackageGrid',
});

withDefaults(
  defineProps<{
    packages: Array<TimeslotOrder>;
  }>(),
  {
    packages: () => [],
  },
);

const hourLivePackageStore = useHourLivePackageStore();
const roomStore = useRoomStore();
const streamerStore = useStreamerStore();

const itemWidth = ref(250);
const scroller = ref();

const itemCount = ref(3);
</script>

<template>
  <div class="container mx-auto">
    <!-- Grid Container -->
    <div
      class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3"
    >
      <!-- Grid Items -->
      <div
        v-for="item in packages"
        :key="item.id"
        class="rounded-lg bg-white p-4 shadow-md"
      >
        <HourLivePackageCard :item="item" />
      </div>

      <!-- Empty State -->
      <Empty
        v-if="packages.length === 0"
        class="col-span-full"
        description="暂无数据"
      />
    </div>
  </div>
</template>

<style scoped></style>

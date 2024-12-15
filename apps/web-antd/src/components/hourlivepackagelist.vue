<script lang="ts" setup>
import type { TimeslotOrder } from '#/types';

import { ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { useElementBounding } from '@vueuse/core';
import {} from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import HourLivePackageCard from '#/components/hourlivepackagecard.vue';
import { useHourLivePackageStore } from '#/store';
import { useRoomStore } from '#/store/room';
import { useStreamerStore } from '#/store/streamer';

defineOptions({
  name: 'HourLivePackageList',
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

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / itemCount.value;
}

function onUpdate(
  viewStartIndex: number,
  viewEndIndex: number,
  visibleStartIndex: number,
  visibleEndIndex: number,
) {
  updateParts.value.viewStartIdx = viewStartIndex;
  updateParts.value.viewEndIdx = viewEndIndex;
  updateParts.value.visibleStartIdx = visibleStartIndex;
  updateParts.value.visibleEndIdx = visibleEndIndex;
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <RecycleScroller
      v-if="packages.length > 0"
      ref="scroller"
      v-slot="{ item }"
      :emit-update="true"
      :grid-items="itemCount"
      :item-secondary-size="itemWidth"
      :item-size="280"
      :items="packages"
      :page-mode="true"
      class="scroller"
      key-field="id"
      @resize="onResize"
      @update="onUpdate"
    >
      <HourLivePackageCard :item="item" class="m-2" />
    </RecycleScroller>
    <Empty
      v-else
      :loading="hourLivePackageStore.packageQueryLoading"
      class="flex-1"
      description="暂无数据"
    />
  </div>
</template>

<style scoped></style>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { useSampleStore } from '#/store';
// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

import { useElementBounding } from '@vueuse/core';

import SampleCard from '#/components/samplecard.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const sampleStore = useSampleStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

const itemWidth = ref(300);
const scroller = ref();
function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

const selectedNames = ref([]);
const selectedItems = ref([]);
const nameOptions = ref(['1', '2', '3', '4', '5', '6', '7', '8']);
const itemOptions = ref([
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
]);

watch(
  selectedNames,
  (newValue) => {
    console.log('xxxxx', newValue);
  },
  { deep: true },
);

watch(
  selectedItems,
  (newValue) => {
    console.log('222', newValue);
  },
  { deep: true },
);

onMounted(() => {
  sampleStore.querySample();
});

function onTop() {}
function onBottom() {
  sampleStore.querySample();
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
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex flex-1 flex-col bg-red-800">
        <RecycleScroller
          ref="scroller"
          v-slot="{ item }"
          :emit-update="true"
          :item-secondary-size="itemWidth"
          :item-size="200"
          :items="sampleStore.sampleList"
          :page-mode="true"
          class="scroller"
          grid-items="2"
          key-field="id"
          @resize="onResize"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <SampleCard :sample="item" />
        </RecycleScroller>
      </div>
    </template>

    <!-- <template #footer> 123 </template> -->
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  /* height: 32%; */

  /* padding: 0 12px; */
  display: flex;
  align-items: center;
}
</style>

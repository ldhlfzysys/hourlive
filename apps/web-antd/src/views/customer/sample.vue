<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { useSampleStore } from '#/store';
// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

import { useElementBounding } from '@vueuse/core';
import { Button } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleCard from '#/components/samplecard.vue';
import SampleForm from '#/components/sampleform.vue';
import SampleKspForm from '#/components/samplekspform.vue';
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
    <template #header>
      <Button type="primary" @click="sampleStore.makeCreate()">
        {{ $t('createsample') }}
      </Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-if="sampleStore.sampleList.length > 0"
          ref="scroller"
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="itemWidth"
          :item-size="230"
          :items="sampleStore.sampleList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @resize="onResize"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <SampleCard :allow-edit="true" :sample="item" />
        </RecycleScroller>
        <Empty
          v-else
          :description="$t('empty_sample_tip')"
          :loading="sampleStore.sampleQueryLoading"
          class="flex-1"
        />
      </div>
      <SampleForm :allow-edit="true" />
      <SampleKspForm :allow-edit="true" />
      <OSSFileForm :allow-edit="true" />
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

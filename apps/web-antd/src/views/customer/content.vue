<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useContentStore, useLiveAccountStore } from '#/store';
// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller';

import { Button } from 'ant-design-vue';

import ContentCard from '#/components/contentcard.vue';
import ContentForm from '#/components/contentform.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const liveaccountStore = useLiveAccountStore();
const contentStore = useContentStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

onMounted(() => {
  liveaccountStore.queryLiveAccount();
  contentStore.queryContent();
});

function onTop() {}
function onBottom() {
  liveaccountStore.queryLiveAccount();
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
      <Button type="primary" @click="liveaccountStore.showModal = true">
        {{ $t('createcontent') }}
      </Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :item-size="210"
          :items="contentStore.contentList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <ContentCard :content="item" />
        </RecycleScroller>
      </div>
      <ContentForm />
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

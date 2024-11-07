<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import { Button } from 'ant-design-vue';

import ContentCard from '#/components/contentcard.vue';
import ContentForm from '#/components/contentform.vue';
import { useContentStore, useLiveAccountStore } from '#/store';
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
  contentStore.queryContent();
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
      <Button type="primary" @click="contentStore.showModal = true">
        {{ $t('createcontent') }}
      </Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <DynamicScroller
          :items="contentStore.contentList"
          :min-item-size="100"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :active="active"
              :data-index="index"
              :item="item"
              class="p-4 first:pt-4"
            >
              <ContentCard :content="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
      <ContentForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}
</style>

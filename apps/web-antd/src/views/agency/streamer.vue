<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import { Button } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import StreamerCard from '#/components/streamercard.vue';
import StreamerForm from '#/components/streamerform.vue';
import { useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const streamerStore = useStreamerStore();

onMounted(() => {
  streamerStore.queryStreamer();
});

function onBottom() {
  streamerStore.queryStreamer();
}

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

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
      <Button
        style="margin-top: 10px; margin-bottom: 10px"
        type="primary"
        @click="streamerStore.makeCreate()"
      >
        {{ $t('add_streamer') }}
      </Button>
    </template>

    <template #content>
      <div class="flex h-full flex-1 flex-col">
        <DynamicScroller
          v-if="streamerStore.streamerList.length > 0"
          :items="streamerStore.streamerList"
          :min-item-size="210"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :active="active"
              :data-index="index"
              :item="item"
              class="p-4 first:pt-4"
            >
              <StreamerCard :streamer="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <Empty
          v-else
          :loading="streamerStore.streamerLoading"
          class="flex-1"
          description="暂无主播数据，点击上方按钮添加"
        />
      </div>
      <StreamerForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.streamer-card-container {
  margin-right: 15px;
  margin-left: 15px;
}
</style>

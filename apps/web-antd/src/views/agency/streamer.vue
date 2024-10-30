<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { useElementBounding } from '@vueuse/core';
import { Button } from 'ant-design-vue';

import StreamerCard from '#/components/streamercard.vue';
import StreamerForm from '#/components/streamerform.vue';
import { useStreamerStore } from '#/store';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const streamerStore = useStreamerStore();

onMounted(() => {
  console.log('=====mounted=====');
  streamerStore.queryStreamer();
});

const itemWidth = ref(300);
const scroller = ref();
function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
}

function onTop() {}
function onBottom() {
  streamerStore.queryStreamer();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <Button
        style="top: 20px"
        type="primary"
        @click="streamerStore.showModal = true"
      >
        新增
      </Button>
      <br />
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="650"
          :item-size="180"
          :items="streamerStore.streamerList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @resize="onResize"
          @scroll-end="onBottom"
          @scroll-start="onTop"
        >
          <div class="streamer-card-container">
            <StreamerCard :streamer="item" />
          </div>
        </RecycleScroller>
      </div>
      <StreamerForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  top: 50px;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.streamer-card-container {
  margin-right: 15px;
  margin-left: 15px;
}
</style>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

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

function onTop() {}
function onBottom() {
  streamerStore.queryStreamer();
}
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <Button type="primary" @click="streamerStore.showModal = true">
        新增
      </Button>
      <br />
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <RecycleScroller
          v-slot="{ item }"
          :emit-update="true"
          :item-size="210"
          :items="streamerStore.streamerList"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @scroll-end="onBottom"
          @scroll-start="onTop"
        >
          <StreamerCard :streamer="item" />
        </RecycleScroller>
      </div>
      <StreamerForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}
</style>

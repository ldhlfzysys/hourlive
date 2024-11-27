<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useLiveAccountStore } from '#/store';
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import { Button } from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import LiveAccountCard from '#/components/liveaccountcard.vue';
import LiveAccountForm from '#/components/liveaccountform.vue';
import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const liveaccountStore = useLiveAccountStore();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

onMounted(() => {
  console.log('onmounted !!! liveaccount');
  liveaccountStore.queryLiveAccount();
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
        {{ $t('createliveaccount') }}
      </Button>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <DynamicScroller
          v-if="liveaccountStore.liveaccountList.length > 0"
          :items="liveaccountStore.liveaccountList"
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
              <LiveAccountCard :liveaccount="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <Empty
          v-else
          :description="$t('empty_liveaccount_tip')"
          :loading="liveaccountStore.liveaccountLoading"
          class="flex-1"
        />
      </div>
      <LiveAccountForm />
    </template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  padding: 16px;
  padding-bottom: 0;
}

:deep(.vue-recycle-scroller__item-wrapper:last-child) {
  padding-bottom: 16px;
}
</style>

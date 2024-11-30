<script lang="ts" setup>
import type { SlotEvent } from '#/types';

import { computed, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';

import { AccessControl } from '@vben/access';
import { SvgShopeeIcon, SvgTiktokIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { useElementBounding } from '@vueuse/core';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Modal,
  Tag,
} from 'ant-design-vue';

import Empty from '#/components/empty.vue';
import OrderApendModal from '#/components/orderApendModal.vue';
import OSSFileForm from '#/components/ossfileform.vue';
import SampleCard from '#/components/samplecard.vue';
import SampleKspForm from '#/components/samplekspform.vue';
import { useAgencyStore, useSampleStore, useTimeslotOrderStore } from '#/store';

defineOptions({
  name: 'OrderDetailModal',
});

const props = defineProps<{
  event: SlotEvent;
}>();
const orderStore = useTimeslotOrderStore();
const sampleStore = useSampleStore();
const agencyStore = useAgencyStore();

const itemWidth = ref(300);
const loading = ref(false);

const maxHeight = computed(() => {
  return window.innerHeight * 0.8;
});

const liveAccountInfo = computed(() => {
  const liveAccount = props.event.contents[0]?.liveaccount;
  return {
    code: liveAccount?.code,
    customer_id: liveAccount?.customer_id,
    live_account: liveAccount?.live_account,
    live_uid: liveAccount?.live_uid,
    liveaccount_id: liveAccount?.id,
    mobile: liveAccount?.mobile,
    name: liveAccount?.name,
    platform: liveAccount?.platform,
  };
});

const contentInfo = computed(() => {
  const content = props.event.contents[0];
  return {
    content_desc: content?.content_desc,
    content_link: content?.content_link,
    content_text: content?.content_text,
    customer_id: content?.customer_id,
  };
});

const scroller = ref();

const updateParts = ref({
  viewEndIdx: 0,
  viewStartIdx: 0,
  visibleEndIdx: 0,
  visibleStartIdx: 0,
});

function onResize() {
  const width = useElementBounding(scroller).width.value;
  itemWidth.value = width / 2;
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

async function handleDeleteOrder() {
  Modal.confirm({
    onOk: async () => {
      loading.value = true;
      await orderStore.deleteOrders({
        timeslot_ids: [props.event.slotId],
        timeslotorder_id: props.event.id,
      });
      loading.value = false;
    },
    title: $t('confirmdelete'),
  });
}
</script>

<template>
  <Modal
    v-model:open="orderStore.showEventDetails"
    :body-style="{ overflowY: 'auto', maxHeight: `${maxHeight}px` }"
    :title="$t('orderdetail')"
    style="top: 10px; width: 85%"
    @cancel="orderStore.showEventDetails = false"
  >
    <div class="flex h-full flex-1 flex-col">
      <Descriptions :column="3" bordered>
        <DescriptionsItem :label="$t('id')">
          {{ props.event.id }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('timeslot')">
          {{ props.event.start }} - {{ props.event.end }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('agency')">
          {{ agencyStore.agencyById(props.event.agency_id)?.name }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('customer')">
          {{ props.event.customer?.code }}
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content')" :span="3">
          {{ props.event.contents[0]?.id }}
        </DescriptionsItem>

        <DescriptionsItem :label="$t('content_text')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div
              v-for="[key, value] in Object.entries(contentInfo)"
              :key="key"
              class="flex items-center"
            >
              <strong>{{ $t(key) }}: </strong>
              <div class="ml-2" v-html="value"></div>
            </div>
          </div>
        </DescriptionsItem>

        <DescriptionsItem :label="$t('liveaccount')" :span="3">
          <div class="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
            <div
              v-for="[key, value] in Object.entries(liveAccountInfo)"
              :key="key"
              class="flex items-center"
            >
              <strong>{{ $t(key) }}: </strong>
              <div v-if="key === 'platform'" class="ml-2">
                <SvgTiktokIcon
                  v-if="value?.toString().toLowerCase() === 'tiktok'"
                  class="size-8"
                />
                <SvgShopeeIcon
                  v-else-if="value?.toString().toLowerCase() === 'shopee'"
                  class="size-8"
                />
                <Tag v-else>
                  {{ value }}
                </Tag>
              </div>
              <div v-else class="ml-2" v-html="value"></div>
            </div>
          </div>
        </DescriptionsItem>
      </Descriptions>

      <div
        v-if="sampleStore.sampleList.length > 0"
        class="flex h-full flex-1 flex-col"
      >
        <br />
        <h1>{{ $t('sample') }}</h1>
        <RecycleScroller
          ref="scroller"
          v-slot="{ item }"
          :emit-update="true"
          :grid-items="2"
          :item-secondary-size="itemWidth"
          :item-size="240"
          :items="sampleStore.sampleList"
          :loading="sampleStore.sampleQueryLoading"
          :page-mode="true"
          class="scroller"
          key-field="id"
          @resize="onResize"
          @update="onUpdate"
        >
          <SampleCard :sample="item" />
        </RecycleScroller>
        <OSSFileForm />
        <SampleKspForm />
      </div>

      <Empty
        v-else
        :loading="sampleStore.sampleQueryLoading"
        class="flex-1"
        description="暂无商品信息"
      />
    </div>

    <template #footer>
      <Button
        key="download"
        :disabled="sampleStore.sampleQueryLoading || orderStore.downloadLoading"
        :loading="orderStore.downloadLoading"
        type="primary"
        @click="orderStore.downloadTimeslotOrder(props.event)"
      >
        {{ $t('download') }}
      </Button>
      <AccessControl :codes="['super']">
        <Button
          key="submit"
          type="primary"
          @click="orderStore.showApendModal = true"
        >
          {{ $t('apendorder') }}
        </Button>
        <Button
          key="submit"
          :loading="loading"
          type="primary"
          @click="handleDeleteOrder"
        >
          {{ $t('delete') }}
        </Button>
      </AccessControl>
    </template>
  </Modal>
  <OrderApendModal v-if="orderStore.showApendModal" :order="props.event" />
</template>

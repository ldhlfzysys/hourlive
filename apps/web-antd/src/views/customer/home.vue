<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  Package,
  Podcast,
  Truck,
  TvMinimalPlay,
  UserRound,
} from 'lucide-vue-next';

import GuideCard from '#/components/guidecard.vue';
import HourLivePage from '#/views/template/common.vue';

const sampleguide = computed(() => [
  {
    description: $t('addsampledesc'),
    icon: Package,
    leftText: $t('addsample'),
    routerPath: '/sample',
    title: $t('createsample'),
  },
  {
    description: $t('shippingsampledesc'),
    icon: Truck,
    leftText: $t('shippingsample'),
    routerPath: '/content',
    title: $t('shippingsample'),
  },
]);

const contentguide = computed(() => [
  {
    description: $t('createliveaccountdesc'),
    icon: UserRound,
    leftText: $t('createliveaccount'),
    routerPath: '/liveaccount',
    title: $t('createliveaccount'),
  },
  {
    description: $t('createcontentdesc'),
    icon: TvMinimalPlay,
    leftText: $t('createcontent'),
    routerPath: '/content',
    title: $t('createcontent'),
  },
]);

const orderguide = computed(() => [
  {
    description: $t('pick_package_des'),
    icon: Podcast,
    leftText: $t('pick_package'),
    routerPath: '/content',
    title: $t('hourlivepackage'),
  },
]);
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex flex-col p-3">
        <div class="flex flex-row gap-4">
          <GuideCard
            :items="sampleguide"
            :title="$t('guide_sample')"
            :tooltip="$t('guide_sample_tooltip')"
          />
          <GuideCard
            :items="contentguide"
            :title="$t('guide_content')"
            :tooltip="$t('guide_content_tooltip')"
          />
          <GuideCard
            :items="orderguide"
            :title="$t('guide_order')"
            :tooltip="$t('guide_order_tooltip')"
          />
        </div>
      </div>
    </template>

    <template #footer></template>
  </HourLivePage>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  display: flex;
  align-items: center;
}
</style>

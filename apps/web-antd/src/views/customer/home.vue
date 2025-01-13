<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Package, Truck, TvMinimalPlay, UserRound } from 'lucide-vue-next';

import GuideCard from '#/components/guidecard.vue';

const sampleguide = computed(() => [
  {
    description: $t('addsampledesc'),
    icon: Package,
    leftText: $t('addsample'),
    routerPath: '/customersample/index',
    title: $t('createsample'),
  },
  {
    description: $t('shippingsampledesc'),
    icon: Truck,
    leftText: $t('shippingsample'),
    routerPath: '/customersampleshipping/index',
    title: $t('shippingsample'),
  },
]);

const contentguide = computed(() => [
  {
    description: $t('createliveaccountdesc'),
    icon: UserRound,
    leftText: $t('createliveaccount'),
    routerPath: '/customerliveaccount/index',
    title: $t('createliveaccount'),
  },
  {
    description: $t('createcontentdesc'),
    icon: TvMinimalPlay,
    leftText: $t('createcontent'),
    routerPath: '/customercontent/index',
    title: $t('createcontent'),
  },
]);
</script>

<template>
  <div class="flex flex-col p-3">
    <div class="flex flex-row gap-4">
      <GuideCard
        :items="sampleguide"
        :title="$t('guide_sample')"
        :tooltip="$t('guide_sample_tooltip')"
        docurl="https://mcn1fj4mlkm2.feishu.cn/docx/Z00TdqI6Wo29FNxSjMDcJSSCnLb"
      />
      <GuideCard
        :items="contentguide"
        :title="$t('guide_content')"
        :tooltip="$t('guide_content_tooltip')"
        docurl="https://mcn1fj4mlkm2.feishu.cn/docx/Z00TdqI6Wo29FNxSjMDcJSSCnLb"
      />
      <!-- <GuideCard
        :items="orderguide"
        :title="$t('guide_order')"
        :tooltip="$t('guide_order_tooltip')"
      /> -->
    </div>
  </div>
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

<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';
import { Calendar, Eye, Podcast, Truck, Users, Video } from 'lucide-vue-next';

import GuideCard from '#/components/guidecard.vue';
import { useAgencyStore } from '#/store/agency';
import HourLivePage from '#/views/template/common.vue';

const agencyStore = useAgencyStore();

onMounted(async () => {
  await agencyStore.fetchAgencyHomeInfo();
});

const agencyGuide = computed(() => [
  {
    description: $t('team_desc'),
    icon: Users,
    leftText: $t('teammanagement'),
    routerPath: '/streamer',
    title: $t('teammanagement'),
  },
  {
    description: $t('room_desc'),
    icon: Video,
    leftText: $t('room'),
    routerPath: '/room',
    title: $t('room'),
  },
  {
    description: $t('package_desc'),
    icon: Podcast,
    leftText: $t('hourlivepackage'),
    routerPath: '/sales',
    title: $t('hourlivepackage'),
  },
  {
    description: $t('shipping_desc'),
    icon: Truck,
    leftText: $t('shipping_address'),
    routerPath: '/shippingaddress',
    title: $t('shipping_address'),
  },
  {
    description: $t('store_desc'),
    icon: Eye,
    leftText: $t('store'),
    routerPath: '/agency/sample',
    title: $t('store'),
  },
  {
    description: $t('schedule_desc'),
    icon: Calendar,
    leftText: $t('schedule_desc'),
    routerPath: '/live/schedule',
    title: $t('schedule'),
  },
]);
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header></template>

    <template #content>
      <div class="flex flex-col p-3">
        <div class="grid grid-cols-[1fr_2fr] gap-4">
          <GuideCard :items="agencyGuide" :title="$t('guide')" />

          <div class="grid grid-cols-2 gap-4">
            <Card :title="$t('today_content')" class="shrink-0">
              <div class="flex flex-col items-center py-4">
                <span
                  class="cursor-pointer text-4xl font-bold text-blue-500 hover:text-blue-600"
                  @click="$router.push('/schedule1')"
                >
                  {{ agencyStore.agencyHomeInfo?.today_content }}
                </span>
                <span class="mt-2 text-gray-500">{{ $t('one_live') }}</span>
              </div>
            </Card>
            <Card :title="$t('onroute_shipping')" class="shrink-0">
              <div class="flex flex-col items-center py-4">
                <span
                  class="cursor-pointer text-4xl font-bold text-blue-500 hover:text-blue-600"
                  @click="$router.push('/shippings')"
                >
                  {{ agencyStore.agencyHomeInfo?.onroute_shipping }}
                </span>
                <span class="mt-2 text-gray-500">{{ $t('one_shipping') }}</span>
              </div>
            </Card>
            <Card :title="$t('new_order')" class="shrink-0">
              <div class="flex flex-col items-center py-4">
                <span
                  class="cursor-pointer text-4xl font-bold text-blue-500 hover:text-blue-600"
                  @click="$router.push('/sales')"
                >
                  {{ agencyStore.agencyHomeInfo?.new_order }}
                </span>
                <span class="mt-2 text-gray-500">{{ $t('one_order') }}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </template>

    <template #footer> </template>
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

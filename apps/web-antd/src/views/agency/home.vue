<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';
import { Calendar, Eye, Podcast, Truck, Users, Video } from 'lucide-vue-next';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header></template>

    <template #content>
      <div class="flex flex-col p-3">
        <div class="grid grid-cols-[auto_auto_auto] items-start gap-4">
          <Card :title="$t('guide')" class="shrink-0">
            <div>
              <!-- 团队管理 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('teammanagement') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Users />
                    <RouterLink to="/streamer">
                      {{ $t('teammanagement') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('team_desc') }}
                  </p>
                </div>
              </div>

              <!-- 房间管理 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('room') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Video />
                    <RouterLink to="/room">
                      {{ $t('room') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('room_desc') }}
                  </p>
                </div>
              </div>

              <!-- 小时直播包 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('hourlivepackage') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Podcast />
                    <RouterLink to="/sales">
                      {{ $t('hourlivepackage') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('package_desc') }}
                  </p>
                </div>
              </div>

              <!-- 收货地址 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('shipping_address') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Truck />
                    <RouterLink to="/shippingaddress">
                      {{ $t('shipping_address') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('shipping_desc') }}
                  </p>
                </div>
              </div>

              <!-- 样品管理 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('store') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Eye />
                    <RouterLink to="/agency/sample">
                      {{ $t('store') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('store_desc') }}
                  </p>
                </div>
              </div>

              <!-- 直播日程 -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('live_schedule') }}
                  </span>
                </div>

                <div
                  class="relative after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
                >
                  <div
                    class="relative z-10 flex size-7 items-center justify-center"
                  >
                    <div
                      class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
                    ></div>
                  </div>
                </div>

                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Calendar />
                    <RouterLink to="/live/schedule">
                      {{ $t('schedule') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('schedule_desc') }}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card class="shrink-0" title="今日场次">
            <div class="flex flex-col items-center py-4">
              <span class="text-4xl font-bold text-blue-500">12</span>
              <span class="mt-2 text-gray-500">场直播</span>
            </div>
          </Card>
          <Card class="shrink-0" title="进行中物流单">
            <div class="flex flex-col items-center py-4">
              <span class="text-4xl font-bold text-green-500">8</span>
              <span class="mt-2 text-gray-500">个订单</span>
            </div>
          </Card>
        </div>
      </div>
    </template>

    <template #footer> 123 </template>
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

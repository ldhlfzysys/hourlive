<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';
import { Package, Truck, TvMinimalPlay, UserRound } from 'lucide-vue-next';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex flex-col p-3">
        <div class="flex flex-row gap-4">
          <!-- Timeline -->
          <Card :title="$t('guide')">
            <div>
              <!-- Item -->
              <div class="flex gap-x-3">
                <!-- Left Content -->
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('addsample')
                  }}</span>
                </div>
                <!-- End Left Content -->

                <!-- Icon -->
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
                <!-- End Icon -->

                <!-- Right Content -->
                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Package />
                    <RouterLink to="/sample">
                      {{ $t('createsample') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('addsampledesc') }}
                  </p>
                </div>
                <!-- End Right Content -->
              </div>
              <!-- End Item -->

              <!-- Item -->
              <div class="flex gap-x-3">
                <!-- Left Content -->
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('createliveaccount')
                  }}</span>
                </div>
                <!-- End Left Content -->

                <!-- Icon -->
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
                <!-- End Icon -->

                <!-- Right Content -->
                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <UserRound />
                    <RouterLink to="/liveaccount">
                      {{ $t('createliveaccount') }}
                    </RouterLink>
                  </h3>
                  <button
                    class="-ms-1 mt-1 inline-flex items-center gap-x-2 rounded-lg border border-transparent p-1 text-xs text-gray-500 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    type="button"
                  >
                    {{ $t('createliveaccountdesc') }}
                  </button>
                </div>
                <!-- End Right Content -->
              </div>
              <!-- End Item -->

              <!-- Item -->
              <div class="flex gap-x-3">
                <!-- Left Content -->
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ $t('createcontent') }}
                  </span>
                </div>
                <!-- End Left Content -->

                <!-- Icon -->
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
                <!-- End Icon -->

                <!-- Right Content -->
                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <TvMinimalPlay />
                    <RouterLink to="/content">
                      {{ $t('createcontent') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('createcontentdesc') }}
                  </p>
                </div>
                <!-- End Right Content -->
              </div>
              <!-- End Item -->

              <!-- Item -->
              <div class="flex gap-x-3">
                <!-- Left Content -->
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('shippingsample')
                  }}</span>
                </div>
                <!-- End Left Content -->

                <!-- Icon -->
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
                <!-- End Icon -->

                <!-- Right Content -->
                <div class="grow pb-8 pt-0.5">
                  <h3
                    class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
                  >
                    <Truck />
                    <RouterLink to="/content">
                      {{ $t('shippingsample') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {{ $t('shippingsampledesc') }}
                  </p>
                </div>
                <!-- End Right Content -->
              </div>
              <!-- End Item -->
            </div>
          </Card>
          <!-- <Card title="今日场次">
            <div></div>
          </Card>
          <Card title="进行中物流单">
            <div></div>
          </Card> -->

          <!-- End Timeline -->
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

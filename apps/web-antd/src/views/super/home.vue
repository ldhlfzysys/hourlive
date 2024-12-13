<script lang="ts" setup>
import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';
import { Calendar, UserRoundSearch, Users } from 'lucide-vue-next';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header> </template>

    <template #content>
      <div class="flex flex-col p-3">
        <div class="flex flex-row gap-4">
          <!-- 修改后的引导卡片 -->
          <Card :title="$t('guide')">
            <div>
              <!-- 日程安排 Item -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('schedule')
                  }}</span>
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
                    <Calendar class="size-5" />
                    <RouterLink to="/super">{{ $t('schedule') }}</RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('schedule_desc') }}
                  </p>
                </div>
              </div>

              <!-- 用户管理 Item -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('user_manager')
                  }}</span>
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
                    <Users class="size-5" />
                    <RouterLink to="/superUsers">
                      {{ $t('user_manager') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('user_manager_desc') }}
                  </p>
                </div>
              </div>

              <!-- 客户内容 Item -->
              <div class="flex gap-x-3">
                <div class="w-20 text-end">
                  <span class="text-xs text-gray-500 dark:text-neutral-400">{{
                    $t('customer_contents')
                  }}</span>
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
                    <UserRoundSearch class="size-5" />
                    <RouterLink to="/customerContents">
                      {{ $t('customer_contents') }}
                    </RouterLink>
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('customer_contents_desc') }}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <!-- 现有的其他卡片 -->
          <Card title="今日场次">
            <div></div>
          </Card>
          <Card title="进行中物流单">
            <div></div>
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

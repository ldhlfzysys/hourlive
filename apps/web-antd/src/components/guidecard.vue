<script lang="ts" setup>
import { Card, Tooltip } from 'ant-design-vue';
import { CircleHelp } from 'lucide-vue-next';

defineOptions({
  name: 'GuideCard',
});

const props = defineProps<Props>();

interface GuideItem {
  leftText: string;
  title: string;
  description: string;
  routerPath: string;
  icon: any;
}

interface Props {
  title: string;
  items: GuideItem[];
  tooltip?: string;
  docurl?: string;
}
</script>

<template>
  <Card>
    <template #title>
      <div class="flex items-center gap-2">
        <span>{{ title }}</span>
        <Tooltip v-if="tooltip" placement="right">
          <template #title>{{ tooltip }}</template>
          <CircleHelp
            :size="18"
            class="select-none text-[14px] text-gray-400"
          />
        </Tooltip>
        <a
          v-if="docurl"
          :href="docurl"
          class="flex-1 text-end text-sm text-gray-400 transition-colors hover:text-gray-600"
          target="_blank"
        >
          {{ $t('guide_doc') }}
        </a>
      </div>
    </template>
    <div>
      <template v-for="item in items" :key="item.title">
        <!-- Item -->
        <div class="flex gap-x-3">
          <!-- Left Content - 增加宽度 -->
          <div class="w-24 shrink-0 text-end">
            <span class="text-xs text-gray-500 dark:text-neutral-400">{{
              item.leftText
            }}</span>
          </div>
          <!-- End Left Content -->

          <!-- Icon - 添加 shrink-0 确保不会被压缩 -->
          <div
            class="relative shrink-0 after:absolute after:bottom-0 after:start-3.5 after:top-7 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 last:after:hidden dark:after:bg-neutral-700"
          >
            <div class="relative z-10 flex size-7 items-center justify-center">
              <div
                class="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"
              ></div>
            </div>
          </div>
          <!-- End Icon -->

          <!-- Right Content - 添加 break-words 确保长文本换行 -->
          <div class="grow pb-8 pt-0.5">
            <h3
              class="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white"
            >
              <component :is="item.icon" class="shrink-0" />
              <RouterLink :to="item.routerPath" class="break-words">
                {{ item.title }}
              </RouterLink>
            </h3>
            <p
              class="mt-1 break-words text-sm text-gray-600 dark:text-neutral-400"
            >
              {{ item.description }}
            </p>
          </div>
          <!-- End Right Content -->
        </div>
        <!-- End Item -->
      </template>
    </div>
  </Card>
</template>

<style scoped>
:deep(.ant-card-head-title) {
  padding-right: 0;
}
</style>

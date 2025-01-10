<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';
import { Calendar, UserRoundSearch, Users } from 'lucide-vue-next';

import GuideCard from '#/components/guidecard.vue';
import { useSuperStore } from '#/store/super';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const superStore = useSuperStore();

onMounted(async () => {
  await superStore.fetchSuperHomeInfo();
});

const superGuide = computed(() => [
  {
    description: $t('schedule_desc'),
    icon: Calendar,
    leftText: $t('schedule'),
    routerPath: '/super',
    title: $t('schedule'),
  },
  {
    description: $t('user_manager_desc'),
    icon: Users,
    leftText: $t('user_manager'),
    routerPath: '/superUsers',
    title: $t('user_manager'),
  },
  {
    description: $t('customer_contents_desc'),
    icon: UserRoundSearch,
    leftText: $t('customer_contents'),
    routerPath: '/customerContents',
    title: $t('customer_contents'),
  },
]);
</script>

<template>
  <div class="flex flex-col p-3">
    <div class="grid grid-cols-[1fr_2fr] gap-4">
      <GuideCard :items="superGuide" :title="$t('guide')" />

      <div class="grid grid-cols-1 gap-4">
        <Card :title="$t('today_content')" class="shrink-0">
          <div class="flex flex-col items-center py-4">
            <span
              class="cursor-pointer text-4xl font-bold text-blue-500 hover:text-blue-600"
            >
              {{ superStore.superHomeInfo?.today_content }}
            </span>
            <span class="mt-2 text-gray-500">{{ $t('one_live') }}</span>
          </div>
        </Card>
      </div>
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

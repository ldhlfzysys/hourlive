<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Button, Tag } from 'ant-design-vue';
import { Timer } from 'lucide-vue-next';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const getSkillColor = (skill: string) => {
  const colorMap: Record<string, string> = {
    '3C': 'blue',
    DIY: 'volcano',
    健身: 'lime',
    剪辑: 'purple',
    厨具: 'volcano',
    奢侈品: 'purple',
    家居: 'orange',
    护肤: 'magenta',
    摄影: 'blue',
    数码: 'cyan',
    时尚: 'cyan',
    智能家居: 'green',
    服装: 'blue',
    母婴: 'pink',
    烹饪: 'red',
    玩具: 'purple',
    直播设备: 'cyan',
    穿搭: 'geekblue',
    美妆: 'pink',
    美食: 'orange',
    育儿: 'magenta',
    营养: 'gold',
    装修: 'brown',
    运动: 'green',
  };
  return colorMap[skill] || 'blue';
};

const handleToggleStatus = (item: any) => {
  item.status = item.status === 'online' ? 'offline' : 'online';
};

const itemOptions = ref([
  {
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    description:
      'Professional makeup artist with 8+ years experience. Former MAC senior artist and beauty influencer of the year...',
    duration: 12,
    label: 'Emma Thompson',
    price: 1299,
    skills: ['美妆', '护肤', '奢侈品'],
    status: 'online',
    value: '1',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    description:
      'Fashion buyer and stylist, Paris Fashion Week special guest. Specialized in personal styling and fashion consulting...',
    duration: 8,
    label: 'Sophie Williams',
    price: 999,
    skills: ['服装', '穿搭', '时尚'],
    status: 'online',
    value: '2',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    description:
      'Tech reviewer and smart home expert. Former senior editor at TechRadar with deep insights into consumer electronics...',
    duration: 6,
    label: 'James Chen',
    price: 899,
    skills: ['3C', '数码', '智能家居'],
    status: 'offline',
    value: '3',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    description:
      'Michelin-starred chef with expertise in both Western and Asian cuisine. Passionate about sharing cooking techniques...',
    duration: 10,
    label: 'Oliver Martinez',
    price: 1099,
    skills: ['美食', '烹饪', '厨具'],
    status: 'online',
    value: '4',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    description:
      'Certified fitness trainer and nutritionist. Helped thousands achieve their fitness goals through personalized programs...',
    duration: 4,
    label: 'Alex Foster',
    price: 699,
    skills: ['运动', '健身', '营养'],
    status: 'offline',
    value: '5',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    description:
      'Child development specialist and parenting expert. Focuses on early childhood education and development...',
    duration: 8,
    label: 'Sarah Parker',
    price: 899,
    skills: ['母婴', '育儿', '玩具'],
    status: 'online',
    value: '6',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    description:
      'Interior designer with a passion for creating beautiful living spaces. Expert in home renovation and DIY projects...',
    duration: 6,
    label: 'Isabella White',
    price: 799,
    skills: ['家居', '装修', 'DIY'],
    status: 'online',
    value: '7',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    description:
      'Professional photographer and videographer. Specialized in product photography and video production...',
    duration: 12,
    label: 'Michael Ross',
    price: 1199,
    skills: ['摄影', '剪辑', '直播设备'],
    status: 'offline',
    value: '8',
  },
]);

onMounted(() => {});
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header></template>

    <template #content>
      <div class="flex flex-col">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          <div
            v-for="item in itemOptions"
            :key="item.value"
            class="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <!-- 上架状态标签 -->
            <div class="absolute right-2 top-2">
              <Tag
                v-if="item.status === 'online'"
                class="flex items-center gap-1"
                color="success"
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  ></span>
                  <span
                    class="bg-success relative inline-flex h-2 w-2 rounded-full"
                  ></span>
                </span>
                直播中
              </Tag>
              <Tag v-else class="flex items-center gap-1" color="default">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-gray-300"
                ></span>
                未上架
              </Tag>
            </div>

            <!-- 主播信息区域 -->
            <div class="flex items-start space-x-3">
              <img
                :alt="item.label"
                :src="item.avatar"
                class="h-12 w-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ item.label }}
                  </h3>
                </div>
                <div class="mt-1 flex flex-wrap gap-2">
                  <Tag
                    v-for="skill in item.skills"
                    :key="skill"
                    :color="getSkillColor(skill)"
                  >
                    {{ skill }}
                  </Tag>
                </div>
              </div>
            </div>

            <!-- 描述信息 -->
            <p class="mt-4 line-clamp-2 text-sm text-gray-600">
              {{ item.description }}
            </p>

            <!-- 修改操作按钮区域 -->
            <div class="mt-4 border-t border-gray-100 pt-4">
              <!-- 套餐信息 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center text-gray-600">
                    <Timer class="h-4 w-4" />
                    <span class="ml-1 text-sm">{{ item.duration }}小时</span>
                  </div>
                  <div class="text-primary text-lg font-medium">
                    ¥{{ item.price }}
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="mt-3 flex items-center justify-end space-x-2">
                <Button
                  :type="item.status === 'online' ? 'default' : 'primary'"
                  size="small"
                  @click="handleToggleStatus(item)"
                >
                  {{ item.status === 'online' ? '下架' : '上架' }}
                </Button>
                <Button
                  class="flex items-center"
                  ghost
                  size="small"
                  type="primary"
                >
                  <Timer class="mr-1 h-3 w-3" />
                  设置时段
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer></template>
  </HourLivePage>
</template>

<style scoped>
.text-primary {
  color: #1890ff;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

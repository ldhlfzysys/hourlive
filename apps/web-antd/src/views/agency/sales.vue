<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// @ts-ignore

import { Button } from 'ant-design-vue';

import HourLivePage from '#/views/template/common.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const itemOptions = ref([
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
]);

onMounted(() => {});
</script>

<template>
  <HourLivePage :content-overflow="true">
    <template #header>
      <div>header</div>
    </template>

    <template #content>
      <div class="flex flex-col">
        <div class="flex h-[50px] w-full">出售时间包</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
          <div
            v-for="item in itemOptions"
            :key="item.value"
            class="mb-6 h-[200px] w-[400px] rounded-lg bg-gray-200 p-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <img
                  alt="profile"
                  class="mr-2 h-10 w-10 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <div>
                  <h3 class="text-base font-semibold text-gray-900">
                    主播： {{ item.label }}
                  </h3>
                  <span class="block text-xs font-normal text-gray-500"
                    >擅长：化妆品 3C</span
                  >
                </div>
              </div>
              <div>
                <Button class="mr-2" type="primary">上架</Button
                ><Button type="primary">设置时段</Button>
              </div>
            </div>
            <p class="my-6 text-sm font-normal text-gray-500">
              Hi, I'm Jessica Jane. I am a doctoral student at Harvard
              University majoring in Web . . .
            </p>
            <div
              class="mt-6 flex items-center justify-between text-sm font-semibold text-gray-900"
            >
              <div class="flex">
                <svg
                  class="mr-2 h-5 w-5 text-base text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="mr-1">总时长：12小时</span>
              </div>
              <div class="flex items-center">售价：$130</div>
            </div>
          </div>
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

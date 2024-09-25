<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';

import { Select } from 'ant-design-vue';
import {
  type DefaultOptionType,
  type SelectValue,
} from 'ant-design-vue/es/select';

defineOptions({
  name: 'SelectFilter',
});

const props = defineProps({
  modelValue: {
    default: () => [],
    type: Array<string>,
  },
  options: {
    required: true,
    type: Array<DefaultOptionType>,
  },
  placeholder: {
    default: '请选择选项',
    type: String,
  },
  title: {
    required: true,
    type: String,
  },
});

const emit = defineEmits(['update:modelValue']);

const selectedItems = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    selectedItems.value = newVal; // 同步父组件的值到子组件
  },
);

watch(selectedItems, (newVal) => {
  emit('update:modelValue', newVal); // 更新父组件的值
});

function filterOption(input: string, option: DefaultOptionType): boolean {
  return option.label.toLowerCase().includes(input.toLowerCase());
}

function updateSelectedItems(
  value: SelectValue,
  option: DefaultOptionType | DefaultOptionType[],
) {
  selectedItems.value = value as string[]; // 更新选中项
}
</script>

<template>
  <div class="m-4 flex items-start">
    <!-- rtl让文本从左边溢出;text-right让文本靠右排列 -->
    <span
      class="mr-2 mt-1 w-[80px] whitespace-nowrap text-right font-bold"
      style="direction: rtl"
      >{{ title }}</span
    >
    <div class="flex flex-wrap gap-2">
      <Select
        v-model:value="selectedItems"
        :filter-option="filterOption"
        :options="options"
        :placeholder="placeholder"
        class="w-[800px]"
        mode="multiple"
        show-search
        @change="updateSelectedItems"
      />
    </div>
  </div>
</template>

<style scoped></style>

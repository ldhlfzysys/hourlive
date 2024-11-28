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

const props = withDefaults(defineProps<SelectFilterProps>(), {
  mode: 'multiple',
  placeholder: '请选择',
  width: 'min-w-[200px]',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectValue): void;
}>();

interface SelectFilterProps {
  modelValue: SelectValue;
  options: DefaultOptionType[];
  placeholder?: string;
  title: string;
  width?: string;
  mode?: 'multiple' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE' | 'tags';
}

const selectedItems = ref<SelectValue>(props.modelValue);

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
      class="mr-2 mt-1 whitespace-nowrap text-right font-bold"
      style="direction: rtl"
      >{{ title }}</span
    >
    <div class="flex flex-wrap gap-2">
      <Select
        v-model:value="selectedItems"
        :class="width"
        :filter-option="filterOption"
        :mode="mode"
        :options="options"
        :placeholder="placeholder"
        show-search
        @change="updateSelectedItems"
      />
    </div>
  </div>
</template>

<style scoped></style>

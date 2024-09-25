<script lang="ts" setup>
import { defineEmits, ref, watch } from 'vue';

defineOptions({
  name: 'LabelFilter',
});

const props = defineProps({
  modelValue: {
    required: true,
    type: Array<string>,
  },
  options: {
    required: true,
    type: Array<string>,
  },
  title: {
    required: true,
    type: String,
  },
});

const emit = defineEmits(['update:modelValue']);
const selectedItems = ref(props.modelValue);
function toggleNameSelection(option: string) {
  const index = selectedItems.value.indexOf(option);
  if (index > -1) {
    selectedItems.value.splice(index, 1); // 取消选中
  } else {
    selectedItems.value.push(option); // 添加选中
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    selectedItems.value = newVal; // 同步父组件的值到子组件
  },
);

watch(selectedItems, (newVal) => {
  emit('update:modelValue', newVal); // 更新父组件的值
});
</script>

<template>
  <div class="m-4 flex items-start">
    <span
      class="mr-2 mt-1 w-[80px] whitespace-nowrap text-right font-bold"
      style="direction: rtl"
      >{{ title }}</span
    >
    <div class="flex flex-wrap gap-2">
      <span
        v-for="option in options"
        :key="option"
        :class="[
          modelValue.includes(option)
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground',
        ]"
        class="cursor-pointer rounded px-3 py-1 transition-colors"
        @click="toggleNameSelection(option)"
      >
        {{ option }}
      </span>
    </div>
  </div>
</template>

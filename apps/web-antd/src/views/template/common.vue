<script setup lang="ts">
import { Page } from '@vben/common-ui';

interface Props {
  contentOverflow?: boolean;
}

defineOptions({
  name: 'HourLivePage',
});

const props = withDefaults(defineProps<Props>(), {
  contentOverflow: true,
});
</script>
<template>
  <Page class="bg-card">
    <!-- 导航头高度88px -->
    <div class="flex h-[calc(100vh-88px-32px)] flex-col">
      <!-- Header -->
      <header class="flex flex-wrap p-2">
        <slot name="header"></slot>
      </header>

      <!-- Content -->
      <main :class="{ 'overflow-auto': props.contentOverflow }" class="flex-1">
        <slot name="content"></slot>
      </main>

      <!-- Footer -->
      <footer class="flex">
        <slot name="footer"></slot>
      </footer>
    </div>
  </Page>
</template>

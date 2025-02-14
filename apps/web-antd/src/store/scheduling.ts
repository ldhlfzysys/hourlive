import { ref } from 'vue';

import { defineStore } from 'pinia';

export const useSchedulingStore = defineStore('scheduling-store', () => {
  const showAISchedulingModal = ref(false);

  function $reset() {
    showAISchedulingModal.value = false;
  }

  return {
    $reset,
    showAISchedulingModal,
  };
});

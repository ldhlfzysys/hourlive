// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type {
  AddSampleToContent,
  BaseQuery,
  ContentRead,
  ContentUpdate,
  StandardResponse,
} from '#/types';

async function _getAllContent(params?: BaseQuery) {
  return requestClient.post<StandardResponse<ContentRead[]>>(
    'content/query',
    params,
  );
}

async function _queryContentById(params: BaseQuery) {
  return requestClient.post<StandardResponse<ContentRead[]>>(
    'content/query/ids',
    params,
  );
}

async function _updateContent(params: ContentUpdate) {
  return requestClient.post<StandardResponse<ContentRead>>(
    'content/update',
    params,
  );
}

async function _addSamples(params: AddSampleToContent) {
  return requestClient.post<StandardResponse<ContentRead>>(
    'content/addsample',
    params,
  );
}

async function _removeSamples(params: AddSampleToContent) {
  return requestClient.post<StandardResponse<ContentRead>>(
    'content/removesample',
    params,
  );
}

async function _hideContent(params: BaseQuery) {
  return requestClient.post<StandardResponse<ContentRead>>(
    'content/hide',
    params,
  );
}

// store
export const useContentStore = defineStore('content-store', () => {
  // data
  const contents = ref<Map<number, ContentRead>>(new Map());

  const contentList = computed(() => {
    return [...contents.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, content]) => content); // 转换为Content的list
  });

  const currentContent = ref<ContentUpdate>({
    content_text: '',
    liveaccount_id: undefined,
  });

  const addSample = ref<AddSampleToContent>({
    content_id: -1,
    sample_ids: [],
  });

  // UI - loading
  const queryContentLoading = ref(false);
  const updateContentLoading = ref(false);
  const addSamplesLoading = ref(false);
  const removeSamplesLoading = ref(false);
  const hideContentLoading = ref(false);

  // UI - modal
  const showContentUpdateModal = ref(false);
  const showAddSamplesModal = ref(false);
  const showSampleManagerModal = ref(false);

  // methods
  function makeCreate() {
    showContentUpdateModal.value = true;
    currentContent.value = {};
  }
  function makeUpdate(id: number) {
    showContentUpdateModal.value = true;
    const content = contents.value.get(id);
    if (content) {
      currentContent.value = content;
    }
  }

  function makeSampleManagerUpdate(id: number) {
    showSampleManagerModal.value = true;
    const content = contents.value.get(id);
    if (content) {
      currentContent.value = content;
    }
  }

  async function contentById(id: number) {
    const content = contents.value.get(id);
    if (content) {
      return content;
    }

    queryContentLoading.value = true;
    const res = await _queryContentById({ ids: [id] });
    if (res && res.success && res.data && res.data.length > 0) {
      res.data.forEach((content) => {
        if (content.id) {
          contents.value.set(content.id, content);
        }
      });
    }
    queryContentLoading.value = false;
    return contents.value.get(id);
  }

  function $reset() {
    queryContentLoading.value = false;
    updateContentLoading.value = false;
    addSamplesLoading.value = false;
    removeSamplesLoading.value = false;
    hideContentLoading.value = false;
    currentContent.value = {
      content_text: '',
      liveaccount_id: undefined,
    };
    addSample.value = {
      content_id: -1,
      sample_ids: [],
    };
    contents.value.clear();
  }

  // methods
  async function queryContent() {
    try {
      contentLoading.value = true;
      const res = await _getAllContent(contentQuery.value);
      if (res && res.success) {
        if (res.data.length > 0) {
          const lastContent = res.data.at(-1);
          if (lastContent && lastContent.id) {
            contentQuery.value.q_id = lastContent.id;
          }
        }
        res.data.forEach((content) => {
          if (content.id) {
            contents.value.set(content.id, content);
          }
        });
      }
    } finally {
      contentLoading.value = false;
    }
  }

  async function createContent() {
    try {
      contentCreateLoading.value = true;
      const res = await _newContent(contentCreate.value);
      if (res && res.success && res.data.id) {
        showModal.value = false;
        contents.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      contentCreateLoading.value = false;
    }
  }

  async function updateContent() {
    try {
      contentCreateLoading.value = true;
      const res = await _updateContent(contentCreate.value);
      if (res && res.success && res.data.id) {
        showModal.value = false;
        contents.value.set(res.data.id, res.data);
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      contentCreateLoading.value = false;
    }
  }

  async function addSamples() {
    try {
      const res = await _addSamples(addSample.value);
      if (res && res.success) {
        showAddSamplesModal.value = false;
        // 更新content中的samples
        const content = contents.value.get(addSample.value.content_id);
        if (content && content.id) {
          content.samples = res.data.samples;
          contents.value.set(content.id, content);
        }
      }
    } finally {
      showAddSamplesModal.value = false;
    }
  }

  async function removeSamples() {
    try {
      const res = await _removeSamples(addSample.value);
      if (res && res.success) {
        notification.success({
          description: $t('removesuccess'),
          message: $t('removesuccess'),
        });
      }
      const content = contents.value.get(addSample.value.content_id);
      if (content && content.id) {
        content.samples = res.data.samples;
        contents.value.set(content.id, content);
      }
    } finally {
      // notification.error({
      //   description: $t('removefail'),
      //   message: $t('removefail'),
      // });
    }
  }

  return {
    $reset,
    addSample,
    addSamples,
    contentById,
    contentCreate,
    contentCreateLoading,
    contentList,
    contentLoading,
    contentQuery,
    contents,
    createContent,
    makeCreate,
    makeSampleManagerUpdate,
    makeUpdate,
    queryContent,
    removeSamples,
    showAddSamplesModal,
    showModal,
    showSampleManagerModal,
    updateContent,
  };
});

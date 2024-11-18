// base
import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// types
import type { AddSample, Content, ContentQuery, StanderResult } from '#/types';

function _getAllContent(params?: ContentQuery) {
  return requestClient.post<StanderResult<Content[]>>('content/query', params);
}

function _newContent(params: Content) {
  return requestClient.post<StanderResult<Content>>('content/create', params);
}

function _updateContent(params: Content) {
  return requestClient.post<StanderResult<Content>>('content/update', params);
}

function _addSamples(params: AddSample) {
  return requestClient.post<StanderResult<Content>>(
    'content/addsample',
    params,
  );
}

// store
export const useContentStore = defineStore('content-store', () => {
  // loading

  const contentLoading = ref(false);
  const contentCreateLoading = ref(false);
  const contentCreate = ref<Content>({
    // 根据 Content 类型添加其他必要的初始字段
  });
  const addSample = ref<AddSample>({
    content_id: -1,
    sample_ids: [],
  });
  // contents
  const contents = ref<Map<number, Content>>(new Map());

  const contentList = computed(() => {
    return [...contents.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA) // 按key从大到小排序
      .map(([_, content]) => content); // 转换为Content的list
  });

  const showModal = ref(false);
  const showAddSamplesModal = ref(false);

  function makeCreate() {
    showModal.value = true;
    contentCreate.value = {
      // 根据 Content 类型添加其他必要的初始字段
    };
  }
  function makeUpdate(id: number) {
    showModal.value = true;
    const sample = contents.value.get(id);
    if (sample) {
      contentCreate.value = sample;
    }
  }

  function contentById(id: number) {
    return contents.value.get(id);
  }

  // query
  const contentQuery = ref<ContentQuery>({
    q_id: -1,
    q_order: 'desc',
    q_size: 100,
  });

  function $reset() {
    contentLoading.value = false;
    contentCreateLoading.value = false;
    contentQuery.value.q_id = -1;

    contentQuery.value = {
      q_id: -1,
      q_order: 'desc',
      q_size: 5,
    };
    contents.value = new Map();
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
      }
    } finally {
      showAddSamplesModal.value = false;
    }
  }

  return {
    $reset,
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
    makeUpdate,
    queryContent,
    showAddSamplesModal,
    showModal,
    updateContent,
  };
});

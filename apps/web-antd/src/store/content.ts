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

// store
import { useLiveAccountStore } from './liveaccount';
import { useSampleStore } from './sample';

async function _getAllContent(params?: BaseQuery) {
  return requestClient.post<StandardResponse>('content/query', params);
}

async function _queryContentById(params: BaseQuery) {
  return requestClient.post<StandardResponse>('content/query/ids', params);
}

async function _updateContent(params: ContentUpdate) {
  return requestClient.post<StandardResponse>('content/update', params);
}

async function _addSamples(params: AddSampleToContent) {
  return requestClient.post<StandardResponse>('content/addsample', params);
}

async function _removeSamples(params: AddSampleToContent) {
  return requestClient.post<StandardResponse>('content/removesample', params);
}

async function _hideContent(params: BaseQuery) {
  return requestClient.post<StandardResponse>('content/hide', params);
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
  const contentLoading = ref(false);
  const contentCreateLoading = ref(false);

  // UI - modal
  const showModal = ref(false);
  const showAddSamplesModal = ref(false);
  const showSampleManagerModal = ref(false);

  const contentQuery = ref<BaseQuery>({
    q_id: -1, // 默认值，表示查询所有内容
    q_order: 'desc', // 默认排序方式
    q_size: 30, // 每次请求的内容数量
  });

  const contentCreate = ref<ContentUpdate>({
    content_text: '',
    liveaccount_id: undefined,
  });

  // 适配select组件
  const contentOptions = computed(() => {
    return contentList.value.map((item: ContentRead) => {
      if (item.liveaccount?.name && item.liveaccount?.live_account && item.id) {
        return {
          label: `${item.id} - ${item.liveaccount.name} - ${item.liveaccount.live_account}`,
          value: item.id,
        };
      }
      return { label: String(item.id), value: item.id };
    });
  });

  // 引入其他store
  const liveAccountStore = useLiveAccountStore();
  const sampleStore = useSampleStore();

  function setContents(cs: ContentRead[]) {
    cs.forEach((c) => {
      if (c.id) {
        // 更新content
        contents.value.set(c.id, c);

        // 同步更新liveaccount
        if (c.liveaccount) {
          liveAccountStore.setLiveAccounts([c.liveaccount]);
        }

        // 同步更新samples
        if (c.samples && c.samples.length > 0) {
          sampleStore.setSamples(c.samples);
        }
      }
    });
  }

  // methods
  function makeCreate() {
    showModal.value = true;
    contentCreate.value = {
      content_text: '',
      liveaccount_id: undefined,
    };
  }
  function makeUpdate(id: number) {
    showModal.value = true;
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
      // 使用setContents来统一处理数据更新
      setContents(res.data);
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
        // 使用setContents来统一处理数据更新
        setContents(res.data);
      }
    } finally {
      contentLoading.value = false;
    }
  }

  async function createContent() {
    try {
      contentCreateLoading.value = true;
      const res = await _updateContent(contentCreate.value);
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
  async function hideContent(id: number) {
    const res = await _hideContent({ ids: [id] });
    if (res && res.success) {
      contents.value.delete(id);
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
    contentOptions,
    contentQuery,
    contents,
    createContent,
    hideContent,
    makeCreate,
    makeSampleManagerUpdate,
    makeUpdate,
    queryContent,
    removeSamples,
    setContents,
    showAddSamplesModal,
    showModal,
    showSampleManagerModal,
    updateContent,
  };
});

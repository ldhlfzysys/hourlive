import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model & Query
import type { BaseQuery, Content, IdQuery, StanderResult } from '#/types';

// API
enum ContentApi {
  AllContent = 'allcontent',
  CreateContent = 'createcontent',
  DeleteContent = 'deletecontent',
  UpdateContent = 'updatecontent',
}

function getAllContent(params: BaseQuery) {
  return requestClient.post<StanderResult<Content[]>>(
    ContentApi.AllContent,
    params,
  );
}

function createContent(params: Content) {
  return requestClient.post<StanderResult<Content>>(
    ContentApi.CreateContent,
    params,
  );
}

function updateContent(params: Content) {
  return requestClient.post<StanderResult<Content>>(
    ContentApi.UpdateContent,
    params,
  );
}

function deleteContent(params: IdQuery) {
  return requestClient.post<StanderResult<Content>>(
    ContentApi.DeleteContent,
    params,
  );
}

export const useContentStore = defineStore('content-store', () => {
  function $reset() {}

  return {
    $reset,
  };
});

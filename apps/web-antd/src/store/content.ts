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

export function getAllContent(params: BaseQuery) {
  return requestClient.post<StanderResult<Content[]>>(
    ContentApi.AllContent,
    params,
  );
}

export function createContent(params: Content) {
  return requestClient.post<StanderResult<Content>>(
    ContentApi.CreateContent,
    params,
  );
}

export function updateContent(params: Content) {
  return requestClient.post<StanderResult<Content>>(
    ContentApi.UpdateContent,
    params,
  );
}

export function deleteContent(params: IdQuery) {
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

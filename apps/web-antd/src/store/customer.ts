import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model
import type {
  LiveAccount,
  LiveAccountCreate,
  LiveAccountDelete,
  LiveAccountUpdate,
  OSSFile,
  OSSFileDelete,
  StanderResult,
} from '#/types';

// Query

// API
enum CustomerApi {
  CreateLiveAccount = 'createliveaccount',
  DeleteFile = 'deletefile',
  DeleteLiveAccount = 'deleteliveaccount',
  GetFileList = 'getfilelist',

  GetLiveAccount = 'getliveaccount',
  UpdateLiveAccount = 'updateliveaccount',
  UploadFile = 'uploadfile',
}

function getLiveAccount() {
  return requestClient.post<StanderResult<LiveAccount[]>>(
    CustomerApi.GetLiveAccount,
  );
}

function createLiveAccount(params: LiveAccountCreate) {
  return requestClient.post<StanderResult<LiveAccount>>(
    CustomerApi.CreateLiveAccount,
    params,
  );
}

function updateLiveAccount(params: LiveAccountUpdate) {
  return requestClient.post<StanderResult<LiveAccount>>(
    CustomerApi.UpdateLiveAccount,
    params,
  );
}

function deleteLiveAccount(params: LiveAccountDelete) {
  return requestClient.post<StanderResult<any>>(
    CustomerApi.DeleteLiveAccount,
    params,
  );
}

export async function getFileList(productId: number) {
  return requestClient.post<StanderResult<OSSFile[]>>(
    `${CustomerApi.GetFileList}/${productId}`,
  );
}

export async function uploadFile(productId: number, fileData: FormData) {
  return requestClient.post<StanderResult<OSSFile>>(
    `${CustomerApi.UploadFile}/${productId}`,
    fileData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
export async function deleteFile(params: OSSFileDelete) {
  return requestClient.post<StanderResult<string>>(
    `${CustomerApi.DeleteFile}`,
    params,
  );
}

// Store
export const useCustomerStore = defineStore('customer-store', () => {
  function $reset() {}

  return {
    $reset,
  };
});

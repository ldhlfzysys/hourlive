// base
import { ref } from 'vue';

import { message } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';
/*
文件管理（目前只有商品脚本）
根据商品id获取文件列表
上传文件
删除文件
*/

// types
import type { OSSDeleteFile, StandardResponse } from '#/types/schemas';

export async function getFileList(productId: number) {
  return requestClient.post<StandardResponse<{ name: string; url: string }[]>>(
    `/getfilelist/${productId}`,
  );
}

export async function uploadFile(productId: number, fileData: FormData) {
  return requestClient.post<StandardResponse<{ name: string; url: string }>>(
    `/uploadfile/${productId}`,
    fileData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

export async function deleteFile(params: OSSDeleteFile) {
  return requestClient.post<StandardResponse<string>>('/deletefile', params);
}

// API
function _uploadFile(params: { fileData: FormData; product_id: number }) {
  return requestClient.post<StandardResponse<string[]>>(
    `oss/uploadfile/${params.product_id}`,
    params.fileData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

function _deleteFile(params: OSSDeleteFile) {
  return requestClient.post<StandardResponse<string>>('oss/deletefile', params);
}

function _fetchFile(product_id: number) {
  return requestClient.get<StandardResponse<{ name: string; path: string }[]>>(
    `oss/listfiles/${product_id}`,
  );
}

function _fetchFileFromOrder(order_id: number) {
  return requestClient.get<StandardResponse<{ name: string; path: string }[]>>(
    `oss/listorderfiles/${order_id}`,
  );
}

function _listfilesfromids(params: { ids: number[] }) {
  return requestClient.post<StandardResponse<{ name: string; path: string }[]>>(
    `oss/listfilesfromids`,
    params,
  );
}

// 新增的 API 方法
function _uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post<StandardResponse<string>>(
    'oss/uploadavatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

function _uploadAvatarOnly(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post<StandardResponse<string>>(
    'oss/uploadavataronly',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
// 新增的 API 方法
function _uploadHardware(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post<StandardResponse<string>>(
    'oss/uploadhardware',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

// store
export const useOSSFileStore = defineStore('file-store', () => {
  // loading
  const uploading = ref(false);
  const fetching = ref(false);
  const removing = ref(false);

  const currentProductId = ref(0);

  const showModal = ref(false);

  // product_id: <name, path>
  const ossfiles = ref<Record<number, Record<string, string>>>({});

  function $reset() {
    uploading.value = false;
    fetching.value = false;
    ossfiles.value = {};
  }

  /*
  商品脚本相关
  */

  function getFileList(product_id: number) {
    return Object.values(ossfiles.value[product_id] || {});
  }

  async function listFilesFromIds(ids: number[]) {
    const result = await _listfilesfromids({ ids });
    return result;
  }

  async function showOSSFileModal(product_id: number) {
    showModal.value = true;
    currentProductId.value = product_id;
    await fetchFile();
  }

  async function removeFile(file: OSSDeleteFile) {
    removing.value = true;
    const result = await _deleteFile(file);
    if (result && result.success) {
      message.success($t('success'));
    }
    removing.value = false;
  }

  async function uploadFile(file: { fileData: FormData; product_id: number }) {
    uploading.value = true;
    const result = await _uploadFile(file);
    if (result && result.success) {
      message.success($t('success'));
    } else {
      message.error($t('upload_faild'));
    }
    console.log('excute uploading finish');
    uploading.value = false;
  }

  async function fetchFile() {
    fetching.value = true;
    const result = await _fetchFile(currentProductId.value);
    if (result.success) {
      ossfiles.value[currentProductId.value] = Object.fromEntries(
        result.data?.map((item) => [item.name, item.path]) ?? [],
      );
    }
    fetching.value = false;
  }

  async function fetchFileFromOrder(order_id: number) {
    const result = await _fetchFileFromOrder(order_id);
    return result;
  }

  async function uploadAvatar(file: File) {
    uploading.value = true;
    const result = await _uploadAvatar(file);
    if (result && result.success) {
      message.success($t('success'));
    } else {
      message.error($t('upload_faild'));
    }
    uploading.value = false;
    return result;
  }

  async function uploadAvatarOnly(file: File) {
    uploading.value = true;
    const result = await _uploadAvatarOnly(file);
    if (result && result.success) {
      message.success($t('success'));
    } else {
      message.error($t('upload_faild'));
    }
    uploading.value = false;
    return result;
  }

  async function uploadHardware(file: File) {
    uploading.value = true;
    const result = await _uploadHardware(file);
    if (result && result.success) {
      message.success($t('success'));
    } else {
      message.error($t('upload_faild'));
    }
    uploading.value = false;
    return result;
  }

  return {
    $reset,
    currentProductId,
    fetchFile,
    fetchFileFromOrder,
    fetching,
    getFileList,
    listFilesFromIds,
    ossfiles,
    removeFile,
    removing,
    showModal,
    showOSSFileModal,
    uploadAvatar,
    uploadAvatarOnly,
    uploadFile,
    uploadHardware,
    uploading,
  };
});

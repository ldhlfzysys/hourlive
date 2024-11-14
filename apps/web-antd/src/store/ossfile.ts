// base
import { ref } from 'vue';

import { message, notification } from 'ant-design-vue';
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
import type {
  OSSFile,
  OSSFileDelete,
  OSSFileUpload,
  StanderResult,
} from '#/types';

// API
function _uploadFile(params: OSSFileUpload) {
  return requestClient.post<StanderResult<string[]>>(
    `oss/uploadfile/${params.product_id}`,
    params.fileData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

function _deleteFile(params: OSSFileDelete) {
  return requestClient.post<StanderResult<string>>('oss/deletefile', params);
}

function _fetchFile(product_id: number) {
  return requestClient.get<StanderResult<OSSFile[]>>(
    `oss/listfiles/${product_id}`,
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

  async function showOSSFileModal(product_id: number) {
    showModal.value = true;
    currentProductId.value = product_id;
    await fetchFile();
  }

  async function removeFile(file: OSSFileDelete) {
    removing.value = true;
    const result = await _deleteFile(file);
    if (result.success) {
      notification.error({
        description: '',
        message: $t('success'),
      });
    }
    removing.value = false;
  }

  async function uploadFile(file: OSSFileUpload) {
    uploading.value = true;
    const result = await _uploadFile(file);
    if (result && result.success) {
      message.success($t('success'));
    } else {
      message.error($t('error'));
    }
    console.log('excute uploading finish');
    uploading.value = false;
  }

  async function fetchFile() {
    fetching.value = true;
    const result = await _fetchFile(currentProductId.value);
    if (result.success) {
      ossfiles.value[currentProductId.value] = Object.fromEntries(
        result.data.map((item) => [item.name, item.path]),
      );
    }
    fetching.value = false;
  }

  return {
    $reset,
    currentProductId,
    fetchFile,
    fetching,
    ossfiles,
    removeFile,
    removing,
    showModal,
    showOSSFileModal,
    uploadFile,
    uploading,
  };
});

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model
import type {
  IdQuery,
  OSSFile,
  OSSFileDelete,
  ResetPasswordParams,
  StanderResult,
} from '#/types';
import type { Content } from '#/types/IContent';
import type { Customer } from '#/types/ICustomer';
// Query

// API
enum CustomerApi {
  // 查询机构往来的小时播账户
  AgencyGetCustomer = '/agency/getallcustomers',

  AllCustomers = '/super/allcustomers',
  CreateLiveAccount = 'createliveaccount',
  DeleteFile = 'deletefile',

  DeleteLiveAccount = 'deleteliveaccount',
  GetCustomerById = '/queryById',
  GetFileList = 'getfilelist',
  GetLiveAccount = 'getliveaccount',
  UpdateLiveAccount = 'updateliveaccount',
  UploadFile = 'uploadfile',
}

function getCustomerById(id: number) {
  const params: IdQuery = {
    id,
  };
  return requestClient.get<StanderResult<Customer>>(
    `${CustomerApi.GetCustomerById}`,
    {
      params,
    },
  );
}

function getAllCustomers() {
  return requestClient.get<StanderResult<Customer[]>>(CustomerApi.AllCustomers);
}

function _hideCustomer(id: number) {
  return requestClient.post<StanderResult<Customer>>(`customer/hidecustomer`, {
    id,
  });
}

function _resetPassword(params: ResetPasswordParams) {
  return requestClient.post<StanderResult<Customer>>(
    `super/resetUserPassword`,
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

  // 存储机构往来的小时播账户
  const agencyCustomers = ref<StanderResult<Customer[]>>();
  const hideCustomerLoading = ref(false);
  const customerOptions = computed(() => {
    return agencyCustomers.value?.data.map((item: Customer) => ({
      label: item.code,
      value: item.id,
    }));
  });

  async function resetPassword(params: ResetPasswordParams) {
    return _resetPassword(params);
  }

  async function hideCustomer(id: number) {
    hideCustomerLoading.value = true;
    const res = await _hideCustomer(id);
    if (res.success && agencyCustomers.value?.data) {
      agencyCustomers.value.data = agencyCustomers.value.data.filter(
        (item) => item.id !== id,
      );
    }
    hideCustomerLoading.value = false;
  }

  const contentOptions = computed(() => {
    return agencyCustomers.value?.data
      .flatMap((item: Customer) => item?.contents || [])
      .filter((item): item is Content => !!item)
      .map((item: Content) => {
        if (
          item.liveaccount?.name &&
          item.liveaccount?.live_account &&
          item.id
        ) {
          return {
            label: `${item.id} - ${item.liveaccount.name} - ${item.liveaccount.live_account}`,
            value: item.id,
          };
        }
        return { label: String(item.id), value: item.id };
      });
  });

  async function getAgencyCustomers() {
    const response = await requestClient.get<StanderResult<Customer[]>>(
      CustomerApi.AgencyGetCustomer,
    );
    agencyCustomers.value = response;
  }

  async function fetchAllCustomers() {
    const response = await getAllCustomers();
    agencyCustomers.value = response;
  }

  async function customerById(id: number) {
    const customer = agencyCustomers.value?.data.find((item) => item.id === id);
    if (customer === undefined) {
      const response = await getCustomerById(id);
      if (response.code === 200) {
        agencyCustomers.value?.data.push(response.data);
        return response.data;
      }
    }
    return customer;
  }

  return {
    $reset,
    agencyCustomers,
    contentOptions,
    customerById,
    customerOptions,
    fetchAllCustomers,
    getAgencyCustomers,
    hideCustomer,
    hideCustomerLoading,
    resetPassword,
  };
});

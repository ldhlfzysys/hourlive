import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

// Model
import type {
  IdQuery,
  LiveAccount,
  LiveAccountCreate,
  LiveAccountDelete,
  LiveAccountUpdate,
  OSSFile,
  OSSFileDelete,
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

  // 存储机构往来的小时播账户
  const agencyCustomers = ref<StanderResult<Customer[]>>();

  const customerOptions = computed(() => {
    return agencyCustomers.value?.data.map((item: Customer) => ({
      label: item.code,
      value: item.id,
    }));
  });

  const contentOptions = computed(() => {
    return agencyCustomers.value?.data
      .flatMap((item: Customer) => item.contents)
      .map((item: Content) => {
        if (item.liveaccount !== undefined) {
          return {
            label: `${item.liveaccount.name} - ${item.liveaccount.live_account}`,
            value: item.id,
          };
        }
        return { label: item.id.toString(), value: item.id };
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
  };
});

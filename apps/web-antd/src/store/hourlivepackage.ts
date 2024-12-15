/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  DateTimeslot,
  DateTimeslotQuery,
  OrderQuery,
  StanderResult,
  Timeslot,
  TimeslotCreateInMany,
  TimeslotOrder,
  TimeslotOrderCreate,
  TimeslotOrderFormState,
} from '#/types';

import { computed, ref, watch } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';
// API端点枚举
enum HourLivePackageApi {
  AddContent = 'hourlive_package/addcontent',
  ConfirmPackage = 'hourlive_package/confirmtimeslotorder',
  CreatePackage = 'hourlive_package/create',
  DownPackage = 'hourlive_package/downtimeslotorder',
  QueryDateTimeslot = 'timeslotorder/querydatelots',
  QueryPackage = 'hourlive_package/query',
  RemoveContent = 'hourlive_package/removecontent',
  UpPackage = 'hourlive_package/uptimeslotorder',
}

// API请求函数
function _getAllPackages(params?: OrderQuery) {
  return requestClient.post<StanderResult<TimeslotOrder[]>>(
    HourLivePackageApi.QueryPackage,
    params,
  );
}

function _createPackage(data: TimeslotOrderCreate) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.CreatePackage,
    data,
  );
}

function _upPackage(id: number) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.UpPackage,
    { timeslotorder_id: id },
  );
}

function _downPackage(id: number) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.DownPackage,
    { timeslotorder_id: id },
  );
}

function _removeContent(id: number) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.RemoveContent,
    { timeslotorder_id: id },
  );
}

function _confirmPackage(id: number) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.ConfirmPackage,
    { timeslotorder_id: id },
  );
}

function _addContent(content_id: number, timeslotorder_id: number) {
  return requestClient.post<StanderResult<TimeslotOrder>>(
    HourLivePackageApi.AddContent,
    { content_id, timeslotorder_id },
  );
}

function _queryTimeslot(params: DateTimeslotQuery) {
  return requestClient.post<StanderResult<Timeslot[]>>(
    HourLivePackageApi.QueryDateTimeslot,
    params,
  );
}

// 定义store
// #1下单 2退单 3已完成 4时间包未上架 5时间包已上架 6时间包被下单但机构未确认 7机构确认时间包已接收 8机构拒绝时间包
export const useHourLivePackageStore = defineStore(
  'hourlivepackage-store',
  () => {
    const packageQueryLoading = ref(false);
    const packageCreateLoading = ref(false);
    const packages = ref<Map<number, TimeslotOrder>>(new Map());
    const orderQuery = ref<OrderQuery>({});
    const dateTimeslots = ref<Map<string, DateTimeslot[]>>(new Map());
    // computed
    const unlistedPackages = computed(() =>
      packageList.value.filter((pkg) => pkg.status === 4),
    );

    const listedPackages = computed(() =>
      packageList.value.filter((pkg) => pkg.status === 5),
    );

    const pendingPackages = computed(() =>
      packageList.value.filter((pkg) => pkg.status === 6),
    );

    const confirmedPackages = computed(() =>
      packageList.value.filter((pkg) => pkg.status === 7),
    );

    const rejectedPackages = computed(() =>
      packageList.value.filter((pkg) => pkg.status === 8),
    );

    const packageList = computed(() => {
      return [...packages.value.entries()]
        .sort(([keyA], [keyB]) => keyB - keyA)
        .map(([_, pkg]) => pkg);
    });

    // 状态
    const showModal = ref(false);
    watch(showModal, (newVal) => {
      if (newVal) {
        formState.value.timeslots = undefined;
      } else {
        formState.value = {};
        dateTimeslots.value = new Map();
      }
    });

    const timeslotOrderCreate = ref<TimeslotOrderCreate>({
      content_id: 0,
      room_id: 0,
      timeslots: [],
    });
    const formState = ref<TimeslotOrderFormState>({});

    // 查询方法
    async function queryPackages() {
      try {
        packageQueryLoading.value = true;
        const res = await _getAllPackages(orderQuery.value);
        if (res.success) {
          res.data.forEach((pkg: TimeslotOrder) => {
            packages.value.set(pkg.id, pkg);
          });
        }
      } finally {
        packageQueryLoading.value = false;
      }
    }

    // 重置方法
    function $reset() {
      packageQueryLoading.value = false;
      packages.value = new Map();
      timeslotOrderCreate.value = {
        content_id: 0,
        room_id: 0,
        timeslots: [],
      };
    }

    async function makeOrders() {
      if (
        formState.value.timeslots === undefined ||
        formState.value.timeslots.length === 0
      ) {
        return;
      }

      const timeslots: TimeslotCreateInMany[] = [];

      formState.value.timeslots.forEach((slot) => {
        if (slot.canEdit) {
          const startDate = Array.isArray(slot.date) ? slot.date[0] : slot.date;
          const endDate = Array.isArray(slot.date) ? slot.date[1] : slot.date;
          const timeslot: TimeslotCreateInMany = {
            date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
            end_time: slot.slot[1].format('HH:mm'),
            hourlive_money_cost: 0,
            start_time: slot.slot[0].format('HH:mm'),
          };
          timeslots.push(timeslot);
        }
      });

      if (timeslots.length === 0) {
        notification.warning({
          description: $t('currentnochange'),
          message: $t('warning'),
        });
        return;
      }

      const params: TimeslotOrderCreate = {
        content_id: formState.value.contentId ?? -1,
        room_id: formState.value.roomId ?? -1,
        timeslots,
      };

      params.id =
        formState.value.orderId === undefined ? -1 : formState.value.orderId;

      timeslotOrderCreate.value = params;
      createTimePackage();
    }

    async function createTimePackage() {
      try {
        if (!timeslotOrderCreate.value.room_id) {
          notification.error({
            description: $t('请输入房间ID'),
            message: $t('验证失败'),
          });
          return;
        }
        packageCreateLoading.value = true;

        const res = await _createPackage(timeslotOrderCreate.value);
        if (res && res.success) {
          packages.value.set(res.data.id, res.data);
          showModal.value = false;
          timeslotOrderCreate.value = {
            content_id: -1,
            room_id: -1,
            timeslots: [],
          };
          formState.value = {};
          notification.success({
            description: $t('新增时段订单成功'),
            message: $t('操作成功'),
          });
        } else {
          notification.error({
            description: res.message,
            message: $t('addfail'),
          });
        }
      } finally {
        packageCreateLoading.value = false;
      }
    }

    // 上架时间包
    async function upTimePackage(id: number) {
      try {
        const res = await _upPackage(id);
        if (res.success) {
          const pkg = packages.value.get(id);
          if (pkg) {
            pkg.status = 5;
          }
        }
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    // 下架时间包
    async function downTimePackage(id: number) {
      try {
        const res = await _downPackage(id);
        if (res.success) {
          const pkg = packages.value.get(id);
          if (pkg) {
            pkg.status = 4; // 更新状态为未上架
          }
        }
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    // 确认时间包
    async function confirmTimePackage(id: number) {
      try {
        const res = await _confirmPackage(id);
        if (res.success) {
          const pkg = packages.value.get(id);
          if (pkg) {
            pkg.status = 7; // 更新状态为已确认
          }
        }
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    // 移除内容
    async function removeContent(id: number) {
      try {
        const res = await _removeContent(id);
        if (res.success) {
          const pkg = packages.value.get(id);
          if (pkg) {
            pkg.contents = [];
          }
        }
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    // 添加内容
    async function addContent(contentId: number, packageId: number) {
      try {
        const res = await _addContent(contentId, packageId);
        if (res.success) {
          const pkg = packages.value.get(packageId);
          if (pkg) {
            pkg.contents = res.data.contents;
          }
        }
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    // 查询指定日期的时段
    async function queryTimeslots() {
      if (
        !formState.value.roomId ||
        !formState.value.timeslots ||
        formState.value.timeslots.length === 0 ||
        formState.value.timeslots[0] === undefined
      ) {
        return;
      }
      const dates: string[] = [];
      const room_id = formState.value.roomId;

      dateTimeslots.value = new Map();

      formState.value.timeslots?.forEach((slot) => {
        const startDate = slot.slot![0].format('YYYY-MM-DD');
        if (!dates.includes(startDate)) {
          dates.push(startDate);
        }
        const endDate = slot.slot![1].format('YYYY-MM-DD');
        if (!dates.includes(endDate)) {
          dates.push(endDate);
        }
        const timeslots = dateTimeslots.value.get(startDate) ?? [];
        timeslots.push({
          date: startDate,
          end_time: slot.slot![1].format('HH:mm'),
          is_create: true,
          room_id,
          start_time: slot.slot![0].format('HH:mm'),
        });

        dateTimeslots.value.set(startDate, timeslots);
      });
      try {
        const params: DateTimeslotQuery = {
          dates,
          roomID: room_id,
        };

        const res = await _queryTimeslot(params);
        if (res.success) {
          const result = res.data;

          result.forEach((timeslot) => {
            const date = timeslot.date;
            if (!dateTimeslots.value.has(date)) {
              dateTimeslots.value.set(date, []);
            }
            dateTimeslots.value.get(date)?.push({
              date: timeslot.date,
              end_time: timeslot.end_time,
              is_create: false,
              room_id: timeslot.room_id,
              start_time: timeslot.start_time,
            });
          });
        }

        dateTimeslots.value = new Map(
          [...dateTimeslots.value.entries()]
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([date, slots]) => [
              date,
              slots.sort((a, b) => a.start_time.localeCompare(b.start_time)),
            ]),
        );
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    return {
      $reset,
      addContent,
      confirmedPackages,
      confirmTimePackage,
      createTimePackage,
      dateTimeslots,
      downTimePackage,
      formState,
      listedPackages,
      makeOrders,
      packageCreateLoading,
      packageList,
      packageQueryLoading,
      packages,
      pendingPackages,
      queryPackages,
      queryTimeslots,
      rejectedPackages,
      removeContent,
      showModal,
      unlistedPackages,
      upTimePackage,
    };
  },
);
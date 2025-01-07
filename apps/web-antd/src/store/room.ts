import type {
  CreateHardwareToRoom,
  Hardware,
  IdQuery,
  Room,
  RoomQuery,
  StanderResult,
} from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// 定义API端点的枚举
enum RoomApi {
  CreateHardwareToRoom = 'room/create_hardware_to_room', // 创建硬件到直播间
  CreateRoom = 'room/create', // 创建直播间
  DeleteHardwareFromRoom = 'room/delete_hardware', // 删除硬件从直播间
  DeleteRoom = 'room/delete', // 删除直播间
  QueryHardware = 'room/query_hardware', // 查询硬件
  QueryHardwareIds = 'room/query_hardware_ids', // 查询硬件ID
  QueryRoom = 'room/query', // 查询直播间
  UpdateHardware = 'room/update_hardware', // 更新硬件
  UpdateRoom = 'room/update', // 更新直播间
}

// 将所有网络请求方法改为私有方法（添加下划线前缀）
function _getAllRooms(params?: RoomQuery) {
  return requestClient.post<StanderResult<Room[]>>(RoomApi.QueryRoom, params);
}

function _newRoom(params: Room) {
  return requestClient.post<StanderResult<Room>>(RoomApi.CreateRoom, params);
}

function _updateRoom(params: Room) {
  return requestClient.post<StanderResult<Room>>(RoomApi.UpdateRoom, params);
}

function _deleteRoom(roomId: number) {
  return requestClient.post<StanderResult<null>>(RoomApi.DeleteRoom, {
    id: roomId,
  });
}

function _addHardwareToRoom(params: CreateHardwareToRoom) {
  return requestClient.post<StanderResult<null>>(
    RoomApi.CreateHardwareToRoom,
    params,
  );
}

function _deleteHardwareFromRoom(params: IdQuery) {
  return requestClient.post<StanderResult<null>>(
    RoomApi.DeleteHardwareFromRoom,
    params,
  );
}

function _queryHardware(roomId: number) {
  return requestClient.post<StanderResult<Hardware[]>>(RoomApi.QueryHardware, {
    room_id: roomId,
  });
}

function _updateHardware(hardware: Hardware) {
  return requestClient.post<StanderResult<Hardware>>(
    RoomApi.UpdateHardware,
    hardware,
  );
}

// 定义Pinia store
export const useRoomStore = defineStore('room-store', () => {
  const roomLoading = ref(false); // 加载状态
  const roomCreateLoading = ref(false); // 创建加载状态
  const roomUpdateLoading = ref(false); // 更新加载状态
  const showRoomDescModal = ref(false); // 控制直播间描述模态框显示
  const roomUpdate = ref<Room>({});
  const hardwareCreate = ref<Hardware>({
    name: '',
  });

  const rooms = ref<Map<number, Room>>(new Map()); // 存储直播间的Map

  // 计算属性，返回排序后的直播间列表
  const roomList = computed(() => {
    return [...rooms.value.entries()]
      .sort(([keyA], [keyB]) => keyB - keyA)
      .map(([_, room]) => room);
  });

  const showModal = ref(false); // 控制模态框显示

  const roomQuery = ref<RoomQuery>({
    agency_id: -1,
    ids: [],
    q_id: -1,
    q_order: 'desc',
    q_size: 30,
  });

  // 重置store状态
  function $reset() {
    roomLoading.value = false;
    roomCreateLoading.value = false;
    roomQuery.value.q_id = -1;
    roomQuery.value = {
      agency_id: -1,
      ids: [],
      q_id: -1,
      q_order: 'desc',
      q_size: 30,
    };
    rooms.value = new Map();
  }

  // 查询直播间
  async function queryRoom() {
    try {
      roomLoading.value = true;
      const res = await _getAllRooms(roomQuery.value);
      if (res && res.success) {
        if (res.data.length > 0) {
          const lastRoom = res.data.at(-1);
          if (lastRoom) {
            roomQuery.value.q_id = lastRoom.id;
          }
        }
        res.data.forEach((room) => {
          rooms.value.set(room.id, room);
        });
      }
    } finally {
      roomLoading.value = false;
    }
  }

  // 创建直播间
  async function createRoom() {
    try {
      if (!roomUpdate.value.name) {
        notification.error({
          description: $t('请输入直播间名称'),
          message: $t('验证失败'),
        });
        return;
      }
      roomCreateLoading.value = true;

      const res = await _newRoom(roomUpdate.value);
      if (res && res.success) {
        rooms.value.set(res.data.id, res.data);
        showModal.value = false;
        // 清空当前新增对象数据
        roomUpdate.value = {
          agency_id: -1,
          name: '',
        };
        notification.success({
          description: $t('新增直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('addfail'),
        });
      }
    } finally {
      roomCreateLoading.value = false;
    }
  }

  async function makeRoomUpdate(id: number) {
    const room = rooms.value.get(id);
    if (room) {
      roomUpdate.value = room;
    }
  }

  // 修改直播间
  async function modifyRoom() {
    try {
      roomLoading.value = true;
      roomUpdateLoading.value = true;
      const res = await _updateRoom(roomUpdate.value);
      if (res && res.success && res.data.id) {
        // 获取现有的房间数据
        const existingRoom = rooms.value.get(res.data.id);
        // 只更新 name 和 desc，保留其他数据
        const updatedRoom = {
          ...existingRoom,
          desc: res.data.desc,
          name: res.data.name,
        };
        rooms.value.set(res.data.id, updatedRoom);
        showModal.value = false;
        showRoomDescModal.value = false;
        notification.success({
          description: $t('修改直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      roomLoading.value = false;
      roomUpdateLoading.value = false;
    }
  }

  // 删除直播间
  async function removeRoom(roomId: number) {
    try {
      roomLoading.value = true;
      const res = await _deleteRoom(roomId);
      if (res && res.success) {
        rooms.value.delete(roomId);
        notification.success({
          description: $t('删除直播间成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('deletefail'),
        });
      }
    } finally {
      roomLoading.value = false;
    }
  }

  // 删除硬件从房间
  async function deleteHardwareFromRoom(params: IdQuery, roomId: number) {
    try {
      const res = await _deleteHardwareFromRoom(params);
      if (res && res.success) {
        const room = rooms.value.get(roomId);
        if (room) {
          // 创建新的硬件数组并重新赋值以确保响应式更新
          const updatedHardwares = room.hardwares.filter(
            (hardware) => hardware.id !== params.id,
          );
          // 创建新的room对象
          const updatedRoom = {
            ...room,
            hardwares: updatedHardwares,
          };
          // 更新Map中的room
          rooms.value.set(roomId, updatedRoom);
        }
      }
    } catch (error) {
      console.error('删除硬件从房间失败:', error);
      notification.error({
        description: '删除硬件从房间失败',
        message: $t('删除失败'),
      });
    }
  }
  // 添加硬件到房间
  async function createHardwareToRoom(params: CreateHardwareToRoom) {
    try {
      const res = await _addHardwareToRoom(params);
      if (res && res.success && res.data) {
        rooms.value.get(params.room_id)?.hardwares.push(res.data);
        notification.success({
          description: $t('添加硬件成功'),
          message: $t('操作成功'),
        });
      } else {
        notification.error({
          description: res.message,
          message: $t('添加失败'),
        });
      }
    } catch (error) {
      console.error('添加硬件到房间失败:', error);
      notification.error({
        description: '添加硬件到房间失败',
        message: $t('添加失败'),
      });
    }
  }

  // 返回store中的状态和方法
  return {
    $reset,
    _addHardwareToRoom,
    _queryHardware,
    _updateHardware,
    createHardwareToRoom,
    createRoom,
    deleteHardwareFromRoom,

    hardwareCreate,
    makeRoomUpdate,
    modifyRoom,
    queryRoom,
    removeRoom, // 确保在返回对象中包含 removeRoom

    roomCreateLoading,
    roomList,
    roomLoading,
    roomQuery,
    rooms,
    roomUpdate,
    roomUpdateLoading,
    showModal,
    showRoomDescModal,
  };
});

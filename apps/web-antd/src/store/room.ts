import type { Room, RoomCreate, RoomQuery, StanderResult } from '#/types';

import { computed, ref } from 'vue';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

// 定义API端点的枚举
enum RoomApi {
  CreateRoom = 'room/create', // 创建直播间
  DeleteRoom = 'room/delete', // 删除直播间
  QueryRoom = 'room/query', // 查询直播间
  UpdateRoom = 'room/update', // 更新直播间
}

// 获取所有直播间
function getAllRooms(params?: RoomQuery) {
  return requestClient.post<StanderResult<Room[]>>(RoomApi.QueryRoom, params);
}

// 创建新的直播间
function newRoom(params: RoomCreate) {
  return requestClient.post<StanderResult<Room>>(RoomApi.CreateRoom, params);
}

// 更新现有的直播间
function updateRoom(params: Room) {
  return requestClient.post<StanderResult<Room>>(RoomApi.UpdateRoom, params);
}

// 删除直播间
function deleteRoom(roomId: number) {
  return requestClient.post<StanderResult<null>>(RoomApi.DeleteRoom, {
    id: roomId,
  });
}

// 定义Pinia store
export const useRoomStore = defineStore('room-store', () => {
  const roomLoading = ref(false); // 加载状态
  const roomCreateLoading = ref(false); // 创建加载状态
  const roomCreate = ref<RoomCreate>({
    agency_id: -1,
    name: '',
  });

  const isEditing = ref(false); // 是否处于编辑状态

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
      q_id: -1,
      q_order: 'desc',
      q_size: 5,
    };
    rooms.value = new Map();
  }

  // 查询直播间
  async function queryRoom() {
    try {
      roomLoading.value = true;
      const res = await getAllRooms(roomQuery.value);
      if (res.success) {
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
      if (!roomCreate.value.name) {
        notification.error({
          description: $t('请输入直播间名称'),
          message: $t('验证失败'),
        });
        return;
      }
      roomCreateLoading.value = true;

      const res = await newRoom(roomCreate.value);
      if (res.success) {
        rooms.value.set(res.data.id, res.data);
        showModal.value = false;
        // 清空当前新增对象数据
        roomCreate.value = {
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

  // 修改直播间
  async function modifyRoom(updatedRoom: Room) {
    try {
      roomLoading.value = true;
      const res = await updateRoom(updatedRoom);
      if (res.success) {
        rooms.value.set(res.data.id, res.data);
        showModal.value = false;
      } else {
        notification.error({
          description: res.message,
          message: $t('updatefail'),
        });
      }
    } finally {
      roomLoading.value = false;
    }
  }

  // 删除直播间
  async function removeRoom(roomId: number) {
    try {
      roomLoading.value = true;
      const res = await deleteRoom(roomId);
      if (res.success) {
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

  // 返回store中的状态和方法
  return {
    $reset,
    createRoom,
    isEditing, // 确保在返回对象中包含 isEditing
    modifyRoom,
    queryRoom,
    removeRoom, // 确保在返回对象中包含 removeRoom
    roomCreate,
    roomCreateLoading,
    roomList,
    roomLoading,
    roomQuery,
    rooms,
    showModal,
  };
});

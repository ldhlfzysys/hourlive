import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:house',
      order: 1,
      title: $t('home'),
    },
    name: 'SuperHome',
    path: '/home',
    children: [
      {
        component: () => import('#/views/common/home.vue'),
        meta: {
          affixTab: false,
          authority: ['super'],
          icon: 'lucide:calendar',
          title: $t('home'),
        },
        name: 'SuperHomeIndex',
        path: '/home',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:menu',
      order: 2,
      title: $t('orderdetail'),
    },
    name: 'SuperOrderDetails',
    path: '/superorderdetails',
    children: [
      {
        component: () => import('#/views/super/orderdetails.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:menu',
          title: $t('orderdetail'),
        },
        name: 'SuperOrderDetailsIndex',
        path: '/superorderdetails/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar',
      order: 3,
      title: $t('schedule'),
    },
    name: 'SuperSchedule',
    path: '/superschedule',
    children: [
      {
        component: () => import('#/views/common/schedule.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:calendar',
          title: $t('schedule'),
        },
        name: 'SuperScheduleIndex',
        path: '/superschedule/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:user-round-search',
      order: 4,
      title: $t('customer_contents'),
    },
    name: 'SuperCustomerContents',
    path: '/supercustomerContents',
    children: [
      {
        component: () => import('#/views/super/customerContents.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round-search',
          title: $t('customer_contents'),
        },
        name: 'SuperCustomerContentsIndex',
        path: '/supercustomerContents/index',
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:users',
      order: 3,
      title: $t('user_manager'),
    },
    name: 'SuperUsers',
    path: '/superusers',
    children: [
      {
        component: () => import('#/views/super/users.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:users',
          title: $t('user_manager'),
        },
        name: 'SuperUsersIndex',
        path: '/superusers/index',
      },
    ],
  },
];

export default routes;

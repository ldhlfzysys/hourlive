import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import config from '#/router/routes/config';

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
    name: 'CustomerHome',
    path: '/home',

    children: [config.superhome],
  },
  // {
  //   component: BasicLayout,
  //   meta: {
  //     authority: ['super'],
  //     hideChildrenInMenu: true,
  //     icon: 'lucide:calendar',
  //     order: -1,
  //     title: $t('schedule'),
  //   },
  //   name: 'SuperSchedule',
  //   path: '/super',

  //   children: [config.schedule],
  // },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar',
      order: 2,
      title: $t('schedule'),
    },
    name: 'SuperSchedule',
    path: '/schedule',

    children: [config.schedule],
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
    name: 'CustomerContents',
    path: '/customerContents',

    children: [config.supercustomercontents],
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
    path: '/superUsers',

    children: [config.superusers],
  },
];

export default routes;

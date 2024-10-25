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

    children: [config.home],
  },
  {
    component: BasicLayout,
    meta: {
      authority: ['super'],
      hideChildrenInMenu: true,
      icon: 'lucide:calendar',
      order: -1,
      title: $t('schedule'),
    },
    name: 'SuperSchedule',
    path: '/super',

    children: [config.schedule],
  },
];

export default routes;

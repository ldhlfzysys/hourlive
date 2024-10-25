import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import config from '#/router/routes/config';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['agency'],
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
      authority: ['agency'],
      hideChildrenInMenu: true,
      icon: 'lucide:package',
      order: -1,
      title: $t('sample'),
    },
    name: 'AgencySales',
    path: '/sales',

    children: [config.sales],
  },
];

export default routes;

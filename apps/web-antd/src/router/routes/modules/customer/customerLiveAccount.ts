import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:user-round',
      order: 2,
      title: $t('liveaccount'),
    },
    name: 'CustomerLiveAccount',
    path: '/liveaccount',

    children: [
      {
        name: 'CustomerLiveAccount',
        path: '/liveaccount',
        component: () => import('#/views/customer/liveaccount.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:user-round',
          title: $t('liveaccount'),
        },
      },
    ],
  },
];

export default routes;

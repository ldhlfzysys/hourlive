import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
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

    children: [
      {
        name: 'Sales',
        path: '/sales',
        component: () => import('#/views/agency/sales.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:package',
          title: $t('sample'),
        },
      },
    ],
  },
];

export default routes;

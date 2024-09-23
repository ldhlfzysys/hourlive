import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:package',
      order: -1,
      title: $t('sample'),
    },
    name: 'CustomerSample',
    path: '/customer',

    children: [
      {
        name: 'Sample',
        path: '/sample',
        component: () => import('#/views/customer/sample.vue'),
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

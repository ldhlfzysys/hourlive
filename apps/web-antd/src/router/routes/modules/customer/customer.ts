import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';
import config from '#/router/routes/config';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      authority: ['customer'],
      hideChildrenInMenu: true,
      icon: 'lucide:package',
      order: 1,
      title: $t('sample'),
    },
    name: 'CustomerSample',
    path: '/customer',

    children: [config.sample],
  },
];

export default routes;

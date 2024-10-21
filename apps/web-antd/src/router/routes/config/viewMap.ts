import { $t } from '#/locales';

const viewMap = {
  sales: {
    component: () => import('#/views/agency/sales.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'Sales',
    path: '/sales',
  },
  sample: {
    component: () => import('#/views/customer/sample.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'Sample',
    path: '/sample',
  },
  schedule: {
    component: () => import('#/views/common/schedule.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:calendar',
      title: $t('schedule'),
    },
    name: 'Schedule',
    path: '/schedule',
  },
};

export default viewMap;

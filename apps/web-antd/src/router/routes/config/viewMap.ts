import { $t } from '#/locales';

const viewMap = {
  agencyhome: {
    component: () => import('#/views/agency/home.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
  agencySample: {
    component: () => import('#/views/agency/sample.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'AgencySample',
    path: '/agency/sample',
  },
  agencyshippings: {
    component: () => import('#/views/agency/shippings.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:orders',
      title: $t('agency_shippings'),
    },
    name: 'AgencyShippings',
    path: '/agencyshippings',
  },
  content: {
    component: () => import('#/views/customer/content.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:tv-minimal-play',
      title: $t('content'),
    },
    name: 'Content',
    path: '/content',
  },
  customerhome: {
    component: () => import('#/views/customer/home.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
  customerSales: {
    component: () => import('#/views/customer/sales.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'CustomerSales',
    path: '/customerSales',
  },
  liveaccount: {
    component: () => import('#/views/customer/liveaccount.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:user-round',
      title: $t('liveaccount'),
    },
    name: 'CustomerLiveAccount',
    path: '/liveaccount',
  },
  orders: {
    component: () => import('#/views/customer/orders.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:calendar-days',
      title: $t('sample'),
    },
    name: 'Orders',
    path: '/orders',
  },
  profile: {
    component: () => import('#/views/customer/profile.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:user',
      title: $t('个人中心'),
    },
    name: 'Profile',
    path: '/profile',
  },
  room: {
    component: () => import('#/views/agency/room.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:video',
      title: $t('room'),
    },
    name: 'Room',
    path: '/room',
  },
  sales: {
    component: () => import('#/views/agency/sales.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'AgencySales',
    path: '/agencySales',
  },
  sample: {
    component: () => import('#/views/customer/sample.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:package',
      title: $t('sample'),
    },
    name: 'Sample',
    path: '/sample',
  },
  sampleshipping: {
    component: () => import('#/views/customer/sampleshipping.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:truck',
      title: $t('sampleshipping'),
    },
    name: 'Sampleshipping',
    path: '/sampleshipping',
  },
  // schedule1: {
  //   component: () => import('#/views/common/schedule1.vue'),
  //   meta: {
  //     affixTab: false,
  //     icon: 'lucide:calendar',
  //     // title: $t('schedule'),
  //     title: 'schedule-x',
  //   },
  //   name: 'Schedule',
  //   path: '/schedule',
  // },
  schedule: {
    component: () => import('#/views/common/schedule.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:calendar',
      title: $t('schedule'),
    },
    name: 'Schedule',
    path: '/schedule',
  },

  shippingaddress: {
    component: () => import('#/views/agency/shipppingaddress.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:map-pin',
      title: $t('shippingaddress'),
    },
    name: 'ShippingAddress',
    path: '/shippingaddress',
  },
  shippings: {
    component: () => import('#/views/customer/shippings.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:orders',
      title: $t('mysampleshipping'),
    },
    name: 'CustomerShippings',
    path: '/customershippings',
  },

  streamer: {
    component: () => import('#/views/agency/streamer.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:users',
      title: $t('teammanagement'),
    },
    name: 'Streamer',
    path: '/streamer',
  },
  supercustomercontents: {
    component: () => import('#/views/super/customerContents.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:user-round-search',
      title: $t('customer_contents'),
    },
    name: 'CustomerContents',
    path: '/customerContents',
  },
  superhome: {
    component: () => import('#/views/super/home.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:calendar',
      title: $t('home'),
    },
    name: 'Home',
    path: '/home',
  },
  superusers: {
    component: () => import('#/views/super/users.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:users',
      title: $t('user_manager'),
    },
    name: 'SuperUsers',
    path: '/superUsers',
  },
};

export default viewMap;

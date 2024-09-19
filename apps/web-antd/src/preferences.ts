import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    authPageLayout: 'panel-center',
    enableCheckUpdates: false,
    name: import.meta.env.VITE_APP_TITLE,
  },
  breadcrumb: {
    showHome: true,
  },
  copyright: {
    companyName: 'HourLive',
    companySiteLink: '',
  },
  sidebar: {
    width: 170,
  },
  theme: {
    builtinType: 'gray',
    colorPrimary: 'hsl(240 5.9% 10%)',
    mode: 'light',
    radius: '0.75',
  },
});

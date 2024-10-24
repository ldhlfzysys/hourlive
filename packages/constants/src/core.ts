/**
 * @zh_CN 登陆页面 url 地址
 */
export const LOGIN_PATH = '/auth/login';

/**
 * @zh_CN 默认首页地址
 */
export const DEFAULT_HOME_PATH = '/auth/login';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'id' | 'ms' | 'th' | 'tl' | 'vi' | 'zh-CN';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Indonesia',
    value: 'id',
  },
  {
    label: 'Malaysia',
    value: 'ms',
  },
  {
    label: 'ภาษาไทย',
    value: 'th',
  },
  {
    label: 'Filipino',
    value: 'tl',
  },
  {
    label: 'Tiếng Việt',
    value: 'vi',
  },
];

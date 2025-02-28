// Token相关类型
export interface Token {
  access_token: string;
  token_type: string;
}

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: Token;
  status_code: number;
  toast?: string;
  total_records: number;
}

// 分页查询
export interface PageQuery {
  q_id?: number;
  q_order?: string;
  q_size?: number;
}

export interface BaseQuery extends PageQuery {
  id?: number;
  ids?: number[];
  customer_id?: number;
  liveaccount_id?: number;
  agency_id?: number;
  room_id?: number;
  timeslotorder_id?: number;
  status?: number;
  is_main?: number;
  content_ids?: number[];
  content_id?: number;
  url?: string;
  begin_date?: string;
  finish_date?: string;
}

// Auth & User
export interface DataVersionRead {
  key: string;
  value: number;
}

export interface UserCreate {
  account: string;
  password: string;
  user_type: number;
  name?: string;
  shipping_address?: string;
  code?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthRead {
  id?: number;
  name: string;
  code: string;
  version?: number;
}

export interface RoleRead {
  id?: number;
  name: string;
  auths?: AuthRead[];
  version?: number;
}

export interface UserRead {
  id?: number;
  account: string;
  user_type: number;
  name?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  home?: string;
  role?: RoleRead;
  version?: number;
}

export interface UserUpdate {
  username?: string;
  mobile?: string;
  email?: string;
  password?: string;
}

// 叶子节点实体
export interface RoomRead {
  id?: number;
  name: string;
  desc?: string;
  hide?: number;
  version?: number;
  hardwares?: HardwareRead[];
}

export interface RoomUpdate {
  id?: number;
  name?: string;
  desc?: string;
}

export interface ShippingAddressRead {
  id?: number;
  address?: string;
  remark?: string;
  hide?: number;
  version?: number;
}

export interface ShippingAddressUpdate {
  id?: number;
  address?: string;
  remark?: string;
  hide?: number;
}

export interface HardwareRead {
  id?: number;
  name?: string;
  image?: string;
  version?: number;
}

export interface HardwareUpdate {
  id?: number;
  name?: string;
  image?: string;
  room_id?: number;
}

export interface TimeslotRead {
  id?: number;
  begin_date?: string;
  finish_date?: string;
  hourlive_money_cost?: number;
  hide?: number;
  type?: number;
  version?: number;
}

export interface TimeslotUpdate {
  id?: number;
  begin_date?: string;
  finish_date?: string;
  hourlive_money_cost?: number;
  streamers?: number[];
}

export interface LiveAccountRead {
  id?: number;
  name?: string;
  code?: string;
  platform?: string;
  live_account?: string;
  live_uid?: string;
  mobile?: string;
  email?: string;
  password?: string;
  hide?: number;
  version?: number;
}

export interface LiveAccountUpdate {
  id?: number;
  name?: string;
  code?: string;
  mobile?: string;
  email?: string;
  platform?: string;
  live_account?: string;
  live_uid?: string;
  password?: string;
  content_ids?: string;
  platform_account?: string;
}

export interface StreamerTagsRead {
  id?: number;
  name?: string;
}

export interface StreamerTagsUpdate {
  id?: number;
  name?: string;
  color?: string;
}

export interface SampleRead {
  id?: number;
  product_image?: string;
  product_name?: string;
  hashtag?: string;
  product_id?: string;
  product_link?: string;
  product_count?: number;
  product_srp?: string;
  product_final_price?: string;
  product_discount?: string;
  product_ksp?: string;
  product_script?: string;
  product_commission?: string;
  is_main?: number;
  hide?: number;
  is_upload_script?: number;
  version?: number;
}

export interface SampleUpdate {
  id?: number;
  product_image?: string;
  product_name?: string;
  hashtag?: string;
  product_id?: string;
  product_link?: string;
  product_srp?: string;
  product_final_price?: string;
  product_discount?: string;
  product_ksp?: string;
  product_script?: string;
  product_commission?: string;
  is_main?: number;
  hide?: number;
}

export interface AddSampleToContent {
  content_id: number;
  sample_ids: number[];
}

// 包含其他实体
export interface ContentRead {
  id?: number;
  is_feiyue?: string;
  content_link?: string;
  content_text?: string;
  content_desc?: string;
  liveaccount?: LiveAccountRead;
  samples?: SampleRead[];
  version?: number;
  hide?: number;
}

export interface ContentUpdate {
  id?: number;
  liveaccount_id?: number;
  is_feiyue?: string;
  sample_ids?: string;
  content_link?: string;
  content_text?: string;
  content_desc?: string;
  timeslot_id?: number;
  hide?: number;
}

export interface CustomerRead {
  id?: number;
  code?: string;
  hide?: number;
  source?: string;
  user?: UserRead;
  version?: number;
  contents?: ContentRead[];
}

export interface StreamerRead {
  id?: number;
  name?: string;
  desc?: string;
  avatar?: string;
  country?: string;
  tags?: StreamerTagsRead[];
}

export interface StreamerUpdate {
  id?: number;
  name?: string;
  hide?: number;
  avatar?: string;
  desc?: string;
  tags?: StreamerTagsUpdate[];
  country?: string;
  password?: string;
  account?: string;
}

export interface AgencyRead {
  id?: number;
  name?: string;
  user?: UserRead;
  rooms?: RoomRead[];
  shippingaddress?: ShippingAddressRead[];
  hide?: number;
  version?: number;
}

export interface TimeslotOrderRead {
  id?: number;
  order_price?: number;
  order_title?: string;
  status?: number;
  tts_subsidy?: number;
  tts_subsidy_remark?: string;
  ads_subsidy?: number;
  ads_subsidy_remark?: string;
  subsidy_type?: string;
  customer?: CustomerRead;
  agency?: AgencyRead;
  room?: RoomRead;
  contents?: ContentRead[];
  hide?: number;
  version?: number;
}

export interface SubsidyUpdate {
  ids: number[];
  tts_subsidy?: number;
  tts_subsidy_remark?: string;
  ads_subsidy?: number;
  ads_subsidy_remark?: string;
  subsidy_type?: string;
}

export interface TimeslotOrderUpdate {
  id?: number;
  room_id?: number;
  content_id?: number;
  timeslots: TimeslotUpdate[];
  order_price?: number;
  order_title?: string;
}

export interface TimeslotOrderCancel {
  id: number;
  timeslot_id: number;
}

export interface HourliveMoneyRecordRead {
  id?: number;
  amount: number;
  before_amount: number;
  after_amount: number;
  type: number;
  version?: number;
}

export interface HourliveMoneyRecordUpdate {
  customer_id: number;
  timeslotorder_id?: number;
  recharge_id?: number;
  amount: number;
  before_amount: number;
  after_amount: number;
  type: number;
}

export interface RechargeRead {
  id?: number;
  pay_time?: string;
  amount?: number;
  gift?: number;
  state?: number;
  version?: number;
}

export interface RechargeUpdate {
  id?: number;
  state?: number;
  amount?: number;
  gift?: number;
  customer_id?: number;
}

export interface SampleShippingSampleRead {
  id: number;
  sample_count: number;
  sample_mark?: string;
}

export interface SampleShippingRead {
  id?: number;
  shipping_time?: string;
  express_company?: string;
  tracking_number?: string;
  sender_name?: string;
  sender_time?: string;
  receiver_name?: string;
  receiver_time?: string;
  hide?: number;
  version?: number;
}

export interface SampleShippingUpdate {
  id?: number;
  agency_id?: number;
  status?: number;
  shipping_time?: string;
  express_company?: string;
  tracking_number?: string;
  sender_name?: string;
  sender_time?: string;
  receiver_name?: string;
  receiver_time?: string;
  receiver_address?: string;
  samples: SampleShippingSampleRead[];
}

// OSS
export interface OSSDeleteFile {
  product_id: number;
  name: string;
}

// Home
export interface AgencyHomeInfo {
  today_content: number;
  onroute_shipping: number;
  new_order: number;
}

export interface SuperHomeInfo {
  today_content: number;
}

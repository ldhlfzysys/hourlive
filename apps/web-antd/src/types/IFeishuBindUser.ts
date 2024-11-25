export interface FeishuBindUser {
  id: number;
  hourlive_user_id: number;
  create_time: string; // DateTime in ISO format
  update_time: string; // DateTime in ISO format
  name?: string;
  avatar_middle?: string;
  open_id?: string;
  union_id?: string;
  user_id?: string;
  email?: string;
  enterprise_email?: string;
  mobile?: string;
  tenant_key?: string;
  employee_no?: string;
}

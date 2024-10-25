export interface Token {
  access_token: string;
  token_type: string;
}

export interface StanderResult<T> {
  success: boolean;
  data: T;
  message: string;
  token: Token;
  toast: string;
  total_records: number;
}

export interface BaseQuery {
  q_id: number; // -1 is all
  q_order: string; // 'asc desc'
  q_size: number;
}

export interface IdQuery {
  id: number;
}

export interface PageQuery {
  page: number;
  page_size: number;
}

export interface Delete {
  id: number;
}

export interface Url {
  url: string;
}

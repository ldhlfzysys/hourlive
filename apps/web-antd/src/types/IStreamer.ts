import type { User } from './IUser';

export interface Streamer {
  id: number;
  name: string;
  user: User;
}

export interface StreamerCreate {
  name: string;
  account: string;
  password: string;
}

export interface PlatformerCreate {
  account: string;
  password: string;
}

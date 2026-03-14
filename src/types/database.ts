export type RequestStatus = 'pending' | 'approved' | 'hold' | 'deleted';

export interface Admin {
  id: string;
  email: string;
  nickname?: string;
  created_at: string;
}

export interface MonthlyTheme {
  id: string;
  title: string;
  description?: string;
  theme_month: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ThemeTrack {
  id: string;
  theme_id: string;
  title: string;
  artist: string;
  order_index: number;
}

export interface SongRequest {
  id: string;
  theme_id: string;
  title: string;
  artist: string;
  youtube_url?: string;
  story?: string;
  requester_name?: string;
  status: RequestStatus;
  admin_memo?: string;
  approved_at?: string;
  created_at: string;
  deleted_at?: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string;
  details?: any;
  created_at: string;
}

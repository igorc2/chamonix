export interface Trip {
  id?: string;
  location: string;
  description: string;
  start_date: Date;
  end_date: Date;
  latitude?: number;
  longitude?: number;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
} 
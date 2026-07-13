export interface AvailableUser {
  id: number;
  username: string;
  name: string;
  role?: string;
}

export interface Ustadz {
  id: number;
  user_id: number;
  name: string;
  specialization: string;
  phone: string;
  active: boolean;
}

export interface CreateUstadzPayload {
  user_id: number;
  specialization?: string;
  phone?: string;
  active?: boolean;
}

export interface UpdateUstadzPayload {
  name: string;
  specialization?: string;
  phone?: string;
  active?: boolean;
}

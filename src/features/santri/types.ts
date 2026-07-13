export interface Santri {
  id: number;
  user_id: number;
  name: string;
  class: string;
  active: boolean;
  halaqah_id: number;
  halaqah_name: string;
}

export interface SantriOption {
  id: number;
  name: string;
  class: string;
  halaqah_name: string;
}

export interface Halaqah {
  id: number;
  name: string;
}

export interface CreateSantriPayload {
  name: string;
  class: string;
  halaqah_id: number | "";
}

export type UpdateSantriPayload = CreateSantriPayload;

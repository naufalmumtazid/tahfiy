export interface Halaqah {
  id: number;
  name: string;
}

export interface HalaqahItem {
  id: number;
  name: string;
  ustadz_id: number;
  ustadz_name: string;
}

export interface UstadzOption {
  id: number;
  name: string;
}

export interface SantriItem {
  id: number;
  name: string;
  class: string;
  active: boolean;
  halaqah_id: number;
  halaqah_name: string;
}

export interface CreateHalaqahPayload {
  name: string;
  ustadz_id: number | "";
}

export type UpdateHalaqahPayload = CreateHalaqahPayload;

export interface CreateSantriPayload {
  name: string;
  class: string;
  halaqah_id: number | "";
}

export type UpdateSantriPayload = CreateSantriPayload;

export interface PromotePayload {
  halaqah_id: number;
  class_prefix: string;
}

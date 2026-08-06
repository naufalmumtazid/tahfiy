import { Santri } from "@/features/santri/types";

export interface Ziyadah {
  id: number;
  santri_id: number;
  name: string;
  class: string;
  halaqah_name: string;
  date: string;
  surat: number;
  santri?: Santri;
  ayat_mulai: number;
  ayat_selesai: number;
}

export interface SantriOption {
  id: number;
  name: string;
  class: string;
  halaqah_name: string;
}

import { Santri } from "@/features/santri/types";

export interface Ziyadah {
  id: number;
  santri_id: number;
  name: string;
  class: string;
  halaqah_name: string;
  date: string;
  surat: number;
  surat_selesai: number | null;
  santri?: Santri;
  ayat_mulai: number;
  ayat_selesai: number;
  jumlah_halaman: number | null;
}

export interface SantriOption {
  id: number;
  name: string;
  class: string;
  halaqah_name: string;
}

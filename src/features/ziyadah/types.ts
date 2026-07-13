import { Santri } from "@/features/santri/types";

export interface Ziyadah {
  id: number;
  santri_id: number;
  name: string;
  class: string;
  halaqah_name: string;
  date: string;
  juz: number;
  santri?: Santri;
  start_page: number;
  end_page: number;
}

export interface SantriOption {
  id: number;
  name: string;
  class: string;
  halaqah_name: string;
}

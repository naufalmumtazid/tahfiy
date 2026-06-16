export interface Halaqah {
  id: number;
  name: string;
}

export interface Ziyadah {
  id: number;
  santri_id: number;
  name: string;
  class: string;
  halaqah_name: string;
  date: string;
  juz: number;
  start_page: number;
  end_page: number;
}

export interface SantriOption {
  id: number;
  name: string;
  class: string;
  halaqah_name: string;
}

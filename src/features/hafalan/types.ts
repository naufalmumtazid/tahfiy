export interface HafalanProgressEntry {
  date: string;
  jumlah_halaman: number | null;
}

export interface SantriDashboardData {
  user: {
    userId: number;
    username: string;
    name?: string;
    role: "santri";
  };
  identity: {
    class: string | null;
    halaqah_name: string | null;
  };
  murojaah: HafalanProgressEntry[];
  ziyadah: HafalanProgressEntry[];
  latestActivity: {
    activityType: "Murojaah" | "Ziyadah";
    date: string;
  } | null;
}

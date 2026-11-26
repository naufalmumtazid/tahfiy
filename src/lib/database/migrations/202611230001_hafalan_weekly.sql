ALTER TABLE public.ziyadah
  ADD COLUMN IF NOT EXISTS surat_selesai INTEGER,
  ADD COLUMN IF NOT EXISTS jumlah_halaman INTEGER;

ALTER TABLE public.murojaah
  ADD COLUMN IF NOT EXISTS surat_selesai INTEGER,
  ADD COLUMN IF NOT EXISTS jumlah_halaman INTEGER;

ALTER TABLE public.ziyadah
  ADD CONSTRAINT ziyadah_surat_selesai_range
    CHECK (surat_selesai IS NULL OR surat_selesai BETWEEN surat AND 114),
  ADD CONSTRAINT ziyadah_jumlah_halaman_positive
    CHECK (jumlah_halaman IS NULL OR jumlah_halaman > 0);

ALTER TABLE public.murojaah
  ADD CONSTRAINT murojaah_surat_selesai_range
    CHECK (surat_selesai IS NULL OR surat_selesai BETWEEN surat AND 114),
  ADD CONSTRAINT murojaah_jumlah_halaman_positive
    CHECK (jumlah_halaman IS NULL OR jumlah_halaman > 0);

ALTER TABLE public.ziyadah
  ADD CONSTRAINT ziyadah_no_saturday_records
    CHECK (EXTRACT(ISODOW FROM date) <> 6) NOT VALID;

ALTER TABLE public.murojaah
  ADD CONSTRAINT murojaah_no_saturday_records
    CHECK (EXTRACT(ISODOW FROM date) <> 6) NOT VALID;

CREATE TABLE public.ujian_mingguan (
  santri_id INTEGER NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  week_start DATE NOT NULL CHECK (EXTRACT(ISODOW FROM week_start) = 1),
  passed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (santri_id, week_start)
);

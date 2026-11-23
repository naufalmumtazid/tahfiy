import { z } from "zod";

export const hafalanSchema = z
  .object({
    santri_id: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Pilih santri terlebih dahulu" }),
    ),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "Tanggal tidak valid"),
    surat: z.preprocess(
      (value) => Number(value),
      z
        .number()
        .int()
        .min(1, { message: "Surat wajib diisi" })
        .max(114, { message: "Surat tidak boleh lebih dari 114" }),
    ),
    surat_selesai: z.preprocess(
      (value) => (value === "" || value == null ? null : Number(value)),
      z
        .number()
        .int()
        .min(1, { message: "Surat akhir tidak valid" })
        .max(114, { message: "Surat akhir tidak boleh lebih dari 114" })
        .nullable(),
    ),
    ayat_mulai: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Ayat mulai wajib diisi" }),
    ),
    ayat_selesai: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Ayat selesai wajib diisi" }),
    ),
    jumlah_halaman: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Jumlah halaman minimal 1" }),
    ),
  })
  .superRefine((data, context) => {
    const suratSelesai = data.surat_selesai ?? data.surat;
    if (suratSelesai < data.surat) {
      context.addIssue({
        code: "custom",
        message: "Surat akhir tidak boleh sebelum surat mulai",
        path: ["surat_selesai"],
      });
    }

    if (suratSelesai === data.surat && data.ayat_selesai < data.ayat_mulai) {
      context.addIssue({
        code: "custom",
        message: "Ayat selesai harus lebih besar atau sama dengan ayat mulai",
        path: ["ayat_selesai"],
      });
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      const day = new Date(`${data.date}T00:00:00.000Z`).getUTCDay();
      if (day === 6) {
        context.addIssue({
          code: "custom",
          message: "Hari Sabtu digunakan untuk ujian, bukan setoran hafalan",
          path: ["date"],
        });
      }
    }
  });

export type HafalanFormValues = z.infer<typeof hafalanSchema>;

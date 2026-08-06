import { z } from "zod";

export const ziyadahSchema = z
  .object({
    santri_id: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Pilih santri terlebih dahulu" })
    ),
    date: z.string().nonempty({ message: "Tanggal wajib diisi" }),
    surat: z.preprocess(
      (value) => Number(value),
      z.number().int().min(1, { message: "Surat wajib diisi" }).max(114, { message: "Surat tidak boleh lebih dari 114" })
    ),
    ayat_mulai: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Ayat mulai wajib diisi" })
    ),
    ayat_selesai: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Ayat selesai wajib diisi" })
    ),
  })
  .refine((data) => data.ayat_selesai >= data.ayat_mulai, {
    message: "Ayat selesai harus lebih besar atau sama dengan ayat mulai",
    path: ["ayat_selesai"],
  });

export type ZiyadahFormValues = z.infer<typeof ziyadahSchema>;

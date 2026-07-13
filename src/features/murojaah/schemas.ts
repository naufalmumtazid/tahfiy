import { z } from "zod";

export const murojaahSchema = z
  .object({
    santri_id: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Pilih santri terlebih dahulu" })
    ),
    date: z.string().nonempty({ message: "Tanggal wajib diisi" }),
    juz: z.preprocess(
      (value) => Number(value),
      z.number().int().min(1, { message: "Juz wajib diisi" }).max(30, { message: "Juz tidak boleh lebih dari 30" })
    ),
    start_page: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Halaman mulai wajib diisi" })
    ),
    end_page: z.preprocess(
      (value) => Number(value),
      z.number().int().positive({ message: "Halaman selesai wajib diisi" })
    ),
  })
  .refine((data) => data.end_page >= data.start_page, {
    message: "Halaman selesai harus lebih besar atau sama dengan halaman mulai",
    path: ["end_page"],
  });

export type MurojaahFormValues = z.infer<typeof murojaahSchema>;

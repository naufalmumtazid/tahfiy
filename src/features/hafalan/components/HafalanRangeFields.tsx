"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FiX } from "react-icons/fi";
import type { HafalanFormValues } from "@/features/hafalan/schemas";
import { suratOptions } from "@/utils/surat";

interface HafalanRangeFieldsProps {
  register: UseFormRegister<HafalanFormValues>;
  setValue: UseFormSetValue<HafalanFormValues>;
  watch: UseFormWatch<HafalanFormValues>;
  errors: FieldErrors<HafalanFormValues>;
}

export function HafalanRangeFields({
  register,
  setValue,
  watch,
  errors,
}: HafalanRangeFieldsProps) {
  const endSurah = watch("surat_selesai");
  const startSurah = watch("surat");

  return (
    <>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register("date")}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none"
        />
        {errors.date && (
          <p className="mt-2 text-xs text-red-600">{errors.date.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Hari Sabtu digunakan untuk ujian, bukan setoran.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Surah mulai <span className="text-red-500">*</span>
          </label>
          <select
            {...register("surat", { valueAsNumber: true })}
            onChange={(event) => {
              const nextSurah = Number(event.target.value);
              setValue("surat", nextSurah, { shouldValidate: true });
              if (endSurah == null) return;
              if (endSurah < nextSurah) {
                setValue("surat_selesai", nextSurah, { shouldValidate: true });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
          >
            {suratOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.surat && (
            <p className="mt-2 text-xs text-red-600">{errors.surat.message}</p>
          )}
        </div>

        <div className="flex items-end">
          {endSurah == null ? (
            <button
              type="button"
              onClick={() =>
                setValue("surat_selesai", startSurah, {
                  shouldValidate: true,
                })
              }
              className="w-full rounded-2xl border border-blue-100 px-4 py-3 text-center text-sm text-blue-700 transition hover:bg-blue-50"
            >
              Tambah surah akhir
            </button>
          ) : (
            <div className="w-full">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Surah akhir <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  {...register("surat_selesai", { valueAsNumber: true })}
                  className="min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
                >
                  {suratOptions
                    .filter((option) => option.value >= startSurah)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setValue("surat_selesai", null, { shouldValidate: true })
                  }
                  className="rounded-xl border border-gray-200 px-3 text-sm text-gray-500 transition hover:bg-gray-50"
                  aria-label="Hapus surah akhir"
                  title="Hapus surah akhir"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              {errors.surat_selesai && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.surat_selesai.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Ayat mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            {...register("ayat_mulai", { valueAsNumber: true })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
          />
          {errors.ayat_mulai && (
            <p className="mt-2 text-xs text-red-600">
              {errors.ayat_mulai.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Ayat selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            {...register("ayat_selesai", { valueAsNumber: true })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
          />
          {errors.ayat_selesai && (
            <p className="mt-2 text-xs text-red-600">
              {errors.ayat_selesai.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Jumlah halaman <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            step={1}
            {...register("jumlah_halaman", { valueAsNumber: true })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
          />
          {errors.jumlah_halaman && (
            <p className="mt-2 text-xs text-red-600">
              {errors.jumlah_halaman.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

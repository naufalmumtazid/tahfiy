import { Halaqah } from "@/features/halaqah/types";
import { Murojaah, SantriOption } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchMurojaah(): Promise<Murojaah[]> {
  const response = await fetch("/api/murojaah");
  const data = await handleJson<{ murojaah?: Murojaah[] }>(response);
  return data.murojaah || [];
}

export async function fetchHalaqahs(): Promise<Halaqah[]> {
  const response = await fetch("/api/halaqah");
  const data = await handleJson<{ halaqahs?: Halaqah[] }>(response);
  return data.halaqahs || [];
}

export async function fetchSantriOptions(): Promise<SantriOption[]> {
  const response = await fetch("/api/santri");
  const data = await handleJson<{ santri?: SantriOption[] }>(response);
  return data.santri || [];
}

export async function createMurojaah(payload: Omit<Murojaah, "id" | "name" | "class" | "halaqah_name">): Promise<Murojaah> {
  const response = await fetch("/api/murojaah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ murojaah?: Murojaah }>(response);
  return data.murojaah || ({} as Murojaah);
}

export async function updateMurojaah(id: number, payload: Omit<Murojaah, "id" | "name" | "class" | "halaqah_name">): Promise<Murojaah> {
  const response = await fetch(`/api/murojaah/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ murojaah?: Murojaah }>(response);
  return data.murojaah || ({} as Murojaah);
}

export async function deleteMurojaah(id: number): Promise<void> {
  const response = await fetch(`/api/murojaah/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

import { Halaqah, Santri, CreateSantriPayload, UpdateSantriPayload } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchSantri(halaqahId?: number): Promise<Santri[]> {
  const url = new URL("/api/santri", window.location.origin);
  if (halaqahId !== undefined) {
    url.searchParams.set("halaqah_id", String(halaqahId));
  }
  const response = await fetch(url.toString());
  const data = await handleJson<{ santri?: Santri[] }>(response);
  return data.santri || [];
}

export async function fetchHalaqahs(): Promise<Halaqah[]> {
  const response = await fetch("/api/halaqah");
  const data = await handleJson<{ halaqahs?: Halaqah[] }>(response);
  return data.halaqahs || [];
}

export async function createSantri(payload: CreateSantriPayload): Promise<Santri> {
  const response = await fetch("/api/santri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ santri?: Santri }>(response);
  return data.santri || ({} as Santri);
}

export async function updateSantri(id: number, payload: UpdateSantriPayload): Promise<Santri> {
  const response = await fetch(`/api/santri/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ santri?: Santri }>(response);
  return data.santri || ({} as Santri);
}

export async function deleteSantri(id: number): Promise<void> {
  const response = await fetch(`/api/santri/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

import { CreateHalaqahPayload, CreateSantriPayload, HalaqahItem, PromotePayload, SantriItem, UstadzOption, UpdateHalaqahPayload, UpdateSantriPayload } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchHalaqahs(): Promise<HalaqahItem[]> {
  const response = await fetch("/api/halaqah");
  const data = await handleJson<{ halaqahs?: HalaqahItem[] }>(response);
  return data.halaqahs || [];
}

export async function fetchUstadzOptions(): Promise<UstadzOption[]> {
  const response = await fetch("/api/ustadz");
  const data = await handleJson<{ ustadz?: UstadzOption[] }>(response);
  return data.ustadz || [];
}

export async function fetchSantriByHalaqah(halaqahId: number): Promise<SantriItem[]> {
  const response = await fetch(`/api/santri?halaqah_id=${halaqahId}`);
  const data = await handleJson<{ santri?: SantriItem[] }>(response);
  return data.santri || [];
}

export async function createHalaqah(payload: CreateHalaqahPayload): Promise<HalaqahItem> {
  const response = await fetch("/api/halaqah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ halaqah?: HalaqahItem }>(response);
  return data.halaqah || ({} as HalaqahItem);
}

export async function updateHalaqah(id: number, payload: UpdateHalaqahPayload): Promise<HalaqahItem> {
  const response = await fetch(`/api/halaqah/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ halaqah?: HalaqahItem }>(response);
  return data.halaqah || ({} as HalaqahItem);
}

export async function deleteHalaqah(id: number): Promise<void> {
  const response = await fetch(`/api/halaqah/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

export async function createSantri(payload: CreateSantriPayload): Promise<SantriItem> {
  const response = await fetch("/api/santri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ santri?: SantriItem }>(response);
  return data.santri || ({} as SantriItem);
}

export async function updateSantri(id: number, payload: UpdateSantriPayload): Promise<SantriItem> {
  const response = await fetch(`/api/santri/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ santri?: SantriItem }>(response);
  return data.santri || ({} as SantriItem);
}

export async function deleteSantri(id: number): Promise<void> {
  const response = await fetch(`/api/santri/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

export async function promoteSantri(payload: PromotePayload): Promise<{ updated: Array<{ id: number; action: string; newClass?: string }> }> {
  const response = await fetch("/api/santri/promote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await handleJson<{ updated: Array<{ id: number; action: string; newClass?: string }> }>(response);
}

import { Ziyadah, SantriOption } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchZiyadah(): Promise<Ziyadah[]> {
  const response = await fetch("/api/ziyadah");
  const data = await handleJson<{ ziyadah?: Ziyadah[] }>(response);
  return data.ziyadah || [];
}

export async function fetchHalaqahs(): Promise<{ id: number; name: string }[]> {
  const response = await fetch("/api/halaqah");
  const data = await handleJson<{ halaqahs?: Array<{ id: number; name: string }> }>(response);
  return data.halaqahs || [];
}

export async function fetchSantriOptions(): Promise<SantriOption[]> {
  const response = await fetch("/api/santri");
  const data = await handleJson<{ santri?: SantriOption[] }>(response);
  return data.santri || [];
}

export async function createZiyadah(payload: Omit<Ziyadah, "id" | "name" | "class" | "halaqah_name">): Promise<Ziyadah> {
  const response = await fetch("/api/ziyadah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ ziyadah?: Ziyadah }>(response);
  return data.ziyadah || ({} as Ziyadah);
}

export async function updateZiyadah(id: number, payload: Omit<Ziyadah, "id" | "name" | "class" | "halaqah_name">): Promise<Ziyadah> {
  const response = await fetch(`/api/ziyadah/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ ziyadah?: Ziyadah }>(response);
  return data.ziyadah || ({} as Ziyadah);
}

export async function deleteZiyadah(id: number): Promise<void> {
  const response = await fetch(`/api/ziyadah/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

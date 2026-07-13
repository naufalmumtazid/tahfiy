import { AvailableUser, CreateUstadzPayload, UpdateUstadzPayload, Ustadz } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchUstadz(): Promise<Ustadz[]> {
  const response = await fetch("/api/ustadz");
  const data = await handleJson<{ ustadz?: Ustadz[] }>(response);
  return data.ustadz || [];
}

export async function fetchAvailableUsers(): Promise<AvailableUser[]> {
  const response = await fetch("/api/users");
  const data = await handleJson<{ users?: AvailableUser[] }>(response);
  return (data.users || []).filter((user) => user.role === "ustadz");
}

export async function createUstadz(payload: CreateUstadzPayload): Promise<Ustadz> {
  const response = await fetch("/api/ustadz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ ustadz?: Ustadz }>(response);
  return data.ustadz || ({} as Ustadz);
}

export async function updateUstadz(id: number, payload: UpdateUstadzPayload): Promise<Ustadz> {
  const response = await fetch(`/api/ustadz/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ ustadz?: Ustadz }>(response);
  return data.ustadz || ({} as Ustadz);
}

export async function deleteUstadz(id: number): Promise<void> {
  const response = await fetch(`/api/ustadz/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

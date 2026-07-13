import { User, UserFormValues } from "./types";

async function handleJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data as T;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  const data = await handleJson<{ users?: User[] }>(response);
  return data.users || [];
}

export async function createUser(payload: UserFormValues): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ user?: User }>(response);
  return data.user || ({} as User);
}

export async function updateUser(id: number, payload: UserFormValues): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ user?: User }>(response);
  return data.user || ({} as User);
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
  await handleJson<{ success?: boolean }>(response);
}

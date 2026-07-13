export type UserRole = "admin" | "ustadz" | "santri";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export interface UserFormValues {
  username: string;
  name: string;
  password?: string;
  role: UserRole;
}

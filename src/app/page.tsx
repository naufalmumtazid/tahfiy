import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user && user.role === "admin") {
    redirect("/admin");
  }
  redirect("/login");
}

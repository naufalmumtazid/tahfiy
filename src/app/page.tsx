import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (user?.role === "admin") {
    redirect("/admin");
  }

  if (user?.role === "ustadz") {
    redirect("/ustadz");
  }

  if (user?.role === "santri") {
    redirect("/santri");
  }

  redirect("/login");
}

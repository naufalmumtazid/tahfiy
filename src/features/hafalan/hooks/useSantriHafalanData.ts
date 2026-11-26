"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type AuthUser } from "@/actions/auth";
import { getErrorMessage } from "@/utils/error";
import type { Murojaah } from "@/features/murojaah/types";
import { fetchMurojaah } from "@/features/murojaah/repository";
import type { Ziyadah } from "@/features/ziyadah/types";
import { fetchZiyadah } from "@/features/ziyadah/repository";

export function useSantriHafalanData() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [murojaah, setMurojaah] = useState<Murojaah[]>([]);
  const [ziyadah, setZiyadah] = useState<Ziyadah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;

        if (!currentUser || currentUser.role !== "santri") {
          router.replace("/login?error=unauthorized");
          return;
        }

        setUser(currentUser);
        const [murojaahData, ziyadahData] = await Promise.all([
          fetchMurojaah(),
          fetchZiyadah(),
        ]);

        if (!active) return;
        setMurojaah(murojaahData);
        setZiyadah(ziyadahData);
      } catch (cause: unknown) {
        if (active) setError(getErrorMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadData();
    return () => {
      active = false;
    };
  }, [router]);

  return { user, murojaah, ziyadah, loading, error };
}

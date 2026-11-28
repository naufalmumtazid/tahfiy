"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/utils/error";
import {
  fetchSantriDashboardData,
  fetchSantriWeeklyExams,
} from "@/features/hafalan/repository";
import { getMonthWeeks } from "@/features/hafalan/monthly";
import type { SantriDashboardData } from "@/features/hafalan/types";

interface DashboardState {
  monthStart: string;
  data: SantriDashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useSantriDashboardData(monthStart: string) {
  const [state, setState] = useState<DashboardState>(() => ({
    monthStart,
    data: null,
    loading: true,
    error: null,
  }));
  const currentState =
    state.monthStart === monthStart
      ? state
      : { monthStart, data: null, loading: true, error: null };

  useEffect(() => {
    let active = true;

    void fetchSantriDashboardData(monthStart)
      .then((data) => {
        if (active) {
          setState({ monthStart, data, loading: false, error: null });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            monthStart,
            data: null,
            loading: false,
            error: getErrorMessage(cause),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [monthStart]);

  return currentState;
}

interface ExamState {
  monthStart: string;
  passedWeeks: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

export function useSantriWeeklyExamData(monthStart: string) {
  const [state, setState] = useState<ExamState>(() => ({
    monthStart,
    passedWeeks: {},
    loading: true,
    error: null,
  }));
  const currentState =
    state.monthStart === monthStart
      ? state
      : { monthStart, passedWeeks: {}, loading: true, error: null };

  useEffect(() => {
    let active = true;
    const weekStarts = getMonthWeeks(monthStart).map(
      (week) => week.weekStart,
    );

    void fetchSantriWeeklyExams(weekStarts)
      .then((passedWeeks) => {
        if (active) {
          setState({
            monthStart,
            passedWeeks,
            loading: false,
            error: null,
          });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            monthStart,
            passedWeeks: {},
            loading: false,
            error: getErrorMessage(cause),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [monthStart]);

  return currentState;
}

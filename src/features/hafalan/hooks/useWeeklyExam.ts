"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/utils/error";
import {
  fetchWeeklyExam,
  markWeeklyExamPassed,
  undoWeeklyExamPassed,
} from "@/features/hafalan/repository";

export function useWeeklyExam(santriId: number | null, weekStart: string) {
  const requestKey = santriId && weekStart ? `${santriId}:${weekStart}` : "";
  const [state, setState] = useState({
    key: "",
    passed: false,
    loading: false,
    error: null as string | null,
  });

  useEffect(() => {
    let active = true;
    if (!santriId || !weekStart) return;
    void fetchWeeklyExam(santriId, weekStart)
      .then((value) => {
        if (active) {
          setState({
            key: requestKey,
            passed: value,
            loading: false,
            error: null,
          });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            key: requestKey,
            passed: false,
            loading: false,
            error: getErrorMessage(cause),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [requestKey, santriId, weekStart]);

  const currentState =
    state.key === requestKey
      ? state
      : {
          key: requestKey,
          passed: false,
          loading: Boolean(requestKey),
          error: null,
        };

  const toggle = async () => {
    if (!santriId || !weekStart || currentState.loading) return;
    if (
      currentState.passed &&
      !window.confirm("Batalkan tanda lulus ujian pekan ini?")
    ) {
      return;
    }

    setState({
      key: requestKey,
      passed: currentState.passed,
      loading: true,
      error: null,
    });
    try {
      if (currentState.passed) {
        await undoWeeklyExamPassed(santriId, weekStart);
        setState({
          key: requestKey,
          passed: false,
          loading: false,
          error: null,
        });
      } else {
        await markWeeklyExamPassed(santriId, weekStart);
        setState({
          key: requestKey,
          passed: true,
          loading: false,
          error: null,
        });
      }
    } catch (cause: unknown) {
      setState({
        key: requestKey,
        passed: currentState.passed,
        loading: false,
        error: getErrorMessage(cause),
      });
    }
  };

  return {
    passed: currentState.passed,
    loading: currentState.loading,
    error: currentState.error,
    toggle,
  };
}

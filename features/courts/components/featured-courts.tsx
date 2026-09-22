"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CourtCard,
} from "@/features/courts/components/court-card";

import {
  getCourts,
} from "@/features/courts/court.api";

import type {
  Court,
} from "@/features/courts/court.types";

import {
  isAbortError,
} from "@/lib/api/api-client";

export function FeaturedCourts() {
  const [
    courts,
    setCourts,
  ] =
    useState<Court[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    async function load() {
      try {
        setError(false);

        const data =
          await getCourts(
            {
              page: 1,
              limit: 3,
            },

            controller.signal,
          );

        setCourts(
          data.items,
        );
      } catch (error) {
        if (
          isAbortError(
            error,
          )
        ) {
          return;
        }

        setError(true);
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="court-grid">
        {Array.from({
          length: 3,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="court-card court-card-skeleton"
            >
              <div className="skeleton court-skeleton-visual" />

              <div className="court-card-body">
                <div className="skeleton skeleton-line skeleton-line-sm" />

                <div className="skeleton skeleton-line skeleton-line-lg" />

                <div className="skeleton skeleton-line" />
              </div>
            </div>
          ),
        )}
      </div>
    );
  }

  if (
    error ||
    courts.length === 0
  ) {
    return (
      <div className="placeholder">
        <strong>
          Canchas no disponibles
        </strong>

        <span className="muted">
          No fue posible cargar
          el catálogo en este
          momento.
        </span>
      </div>
    );
  }

  return (
    <div className="court-grid">
      {courts.map(
        (court) => (
          <CourtCard
            key={court.id}
            court={court}
          />
        ),
      )}
    </div>
  );
}
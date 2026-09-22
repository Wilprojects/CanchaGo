"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  getCourtById,
} from "@/features/courts/court.api";

import type {
  Court,
} from "@/features/courts/court.types";

import {
  COURT_TYPE_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  isAbortError,
} from "@/lib/api/api-client";

interface CourtDetailProps {
  courtId: number;
}

export function CourtDetail({
  courtId,
}: CourtDetailProps) {
  const [
    court,
    setCourt,
  ] =
    useState<
      Court | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    reloadKey,
    setReloadKey,
  ] =
    useState(0);

  useEffect(
    () => {
      const controller =
        new AbortController();

      getCourtById(
        courtId,
        controller.signal,
      )
        .then(
          (data) => {
            if (
              controller
                .signal
                .aborted
            ) {
              return;
            }

            setCourt(data);
            setError(null);
          },
        )
        .catch(
          (error:
            unknown) => {
            if (
              isAbortError(
                error,
              )
            ) {
              return;
            }

            setError(
              error instanceof
                Error
                ? error.message
                : "No fue posible cargar la cancha.",
            );
          },
        )
        .finally(
          () => {
            if (
              !controller
                .signal
                .aborted
            ) {
              setLoading(
                false,
              );
            }
          },
        );

      return () => {
        controller.abort();
      };
    },
    [
      courtId,
      reloadKey,
    ],
  );

  if (loading) {
    return (
      <div className="court-detail-loading">
        Cargando cancha...
      </div>
    );
  }

  if (
    error ||
    !court
  ) {
    return (
      <div className="catalog-state catalog-state-error">
        <strong>
          No pudimos cargar
          la cancha.
        </strong>

        <p>
          {error ??
            "La cancha no está disponible."}
        </p>

        <button
          type="button"
          className="btn btn-dark"
          onClick={() => {
            setLoading(true);

            setReloadKey(
              (current) =>
                current + 1,
            );
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section className="court-detail">
      <div
        className={
          `court-detail-visual court-card-visual-${court.type.toLowerCase()}`
        }
      >
        <div className="eyebrow">
          {
            COURT_TYPE_LABELS[
              court.type
            ]
          }
        </div>

        <div>
          <h1>
            {court.name}
          </h1>

          <p>
            {court.description}
          </p>
        </div>
      </div>

      <div className="court-detail-info">
        <div>
          <span className="court-category">
            {
              COURT_TYPE_LABELS[
                court.type
              ]
            }
          </span>

          <h2>
            Información de la
            cancha
          </h2>
        </div>

        <div className="court-detail-stats">
          <div>
            <span>
              Capacidad
            </span>

            <strong>
              {court.capacity}{" "}
              personas
            </strong>
          </div>

          <div>
            <span>
              Precio
            </span>

            <strong>
              {formatCourtPrice(
                court.pricePerHour,
              )}
              /hora
            </strong>
          </div>

          <div>
            <span>
              Estado
            </span>

            <strong>
              {court.active
                ? "Disponible para reservas"
                : "No disponible"}
            </strong>
          </div>
        </div>

        {court.active && (
          <ButtonLink
            href={
              `/intranet/reservas/nueva?courtId=${court.id}`
            }
          >
            Reservar esta cancha
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
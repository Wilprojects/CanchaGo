"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getReservations,
} from "@/features/reservations/reservation.api";

import {
  ReservationCard,
} from "@/features/reservations/components/reservation-card";

import type {
  Reservation,
  ReservationPagination,
  ReservationStatus,
} from "@/features/reservations/reservation.types";

import {
  isAbortError,
} from "@/lib/api/api-client";

const INITIAL_PAGINATION:
  ReservationPagination = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 0,
};

interface StatusFilter {
  value:
    | ReservationStatus
    | "";

  label: string;
}

const STATUS_FILTERS:
  StatusFilter[] = [
  {
    value: "",
    label: "Todas",
  },

  {
    value:
      "PENDING_PAYMENT",
    label:
      "Pendientes",
  },

  {
    value:
      "CONFIRMED",
    label:
      "Confirmadas",
  },

  {
    value:
      "RESCHEDULED",
    label:
      "Reprogramadas",
  },

  {
    value:
      "CANCELLED",
    label:
      "Canceladas",
  },

  {
    value:
      "EXPIRED",
    label:
      "Expiradas",
  },
];

export function ReservationList() {
  const [
    reservations,
    setReservations,
  ] =
    useState<
      Reservation[]
    >([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<
      ReservationPagination
    >(
      INITIAL_PAGINATION,
    );

  const [
    status,
    setStatus,
  ] =
    useState<
      ReservationStatus | ""
    >("");

  const [
    page,
    setPage,
  ] =
    useState(1);

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

        getReservations(
        {
            status:
            status ||
            undefined,

            page,

            limit:
            6,
        },

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

            setReservations(
                data.items,
            );

            setPagination(
                data.pagination,
            );

            setError(null);
            },
        )
        .catch(
            (
            error:
                unknown,
            ) => {
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
                : "No fue posible cargar tus reservas.",
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
        status,
        page,
        reloadKey,
    ],
    );

  function handleStatusChange(
    value:
        ReservationStatus | "",
    ) {
    if (
        value === status &&
        page === 1
    ) {
        return;
    }

    setLoading(true);
    setError(null);

    setStatus(value);
    setPage(1);
  }

  function handleRetry() {
    setLoading(true);
    setError(null);

    setReloadKey(
        (current) =>
        current + 1,
    );
  }

  function handlePreviousPage() {
    setLoading(true);
    setError(null);

    setPage(
        (current) =>
        Math.max(
            1,
            current - 1,
        ),
    );
  }

  function handleNextPage() {
    setLoading(true);
    setError(null);

    setPage(
        (current) =>
        current + 1,
    );
  }

  return (
    <>
      <div className="reservation-filters">
        {STATUS_FILTERS.map(
          (filter) => (
            <button
              key={
                filter.value ||
                "ALL"
              }
              type="button"
              className={
                `reservation-filter ${
                  status ===
                  filter.value
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                handleStatusChange(
                  filter.value,
                )
              }
            >
              {filter.label}
            </button>
          ),
        )}
      </div>

      {loading &&
        reservations.length ===
          0 && (
          <div className="reservation-list-grid">
            {Array.from({
              length: 4,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="reservation-card reservation-card-skeleton"
                >
                  <div className="skeleton skeleton-line skeleton-line-sm" />
                  <div className="skeleton skeleton-line skeleton-line-lg" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                </div>
              ),
            )}
          </div>
        )}

      {error && (
        <div className="catalog-state catalog-state-error">
          <strong>
            No pudimos cargar
            tus reservas.
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-dark"
            onClick={
                handleRetry
            }
            >
            Reintentar
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        reservations.length ===
          0 && (
          <div className="catalog-state">
            <strong>
              No tienes reservas
              en esta categoría.
            </strong>

            <p>
              Puedes consultar el
              catálogo para crear
              una nueva reserva.
            </p>
          </div>
        )}

      {!error &&
        reservations.length >
          0 && (
          <>
            <div className="catalog-summary">
              <span>
                {
                  pagination.total
                }{" "}
                {pagination.total ===
                1
                  ? "reserva"
                  : "reservas"}
              </span>

              {loading && (
                <span className="catalog-refreshing">
                  Actualizando...
                </span>
              )}
            </div>

            <div className="reservation-list-grid">
              {reservations.map(
                (
                  reservation,
                ) => (
                  <ReservationCard
                    key={
                      reservation.id
                    }
                    reservation={
                      reservation
                    }
                  />
                ),
              )}
            </div>

            {pagination
              .totalPages >
              1 && (
              <div className="catalog-pagination">
                <button
                    type="button"
                    className="btn btn-outline"
                    disabled={
                        page <= 1 ||
                        loading
                    }
                    onClick={
                        handlePreviousPage
                    }
                    >
                    Anterior
                  </button>

                <span>
                  Página{" "}
                  {
                    pagination.page
                  }{" "}
                  de{" "}
                  {
                    pagination.totalPages
                  }
                </span>

                <button
                    type="button"
                    className="btn btn-outline"
                    disabled={
                        page >=
                        pagination
                            .totalPages ||
                        loading
                    }
                    onClick={
                        handleNextPage
                    }
                    >
                    Siguiente
                  </button>
              </div>
            )}
          </>
        )}
    </>
  );
}
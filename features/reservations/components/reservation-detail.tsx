"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  cancelReservation,
  getReservationById,
} from "@/features/reservations/reservation.api";

import {
  RescheduleForm,
} from "@/features/reservations/components/reschedule-form";

import type {
  Reservation,
} from "@/features/reservations/reservation.types";

import {
  COURT_TYPE_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  canManageReservation,
  formatReservationDateTime,
  getReservationDurationHours,
  getReservationStatusClass,
  RESERVATION_STATUS_LABELS,
} from "@/features/reservations/reservation.utils";

import {
  isAbortError,
} from "@/lib/api/api-client";

interface ReservationDetailProps {
  reservationId:
    number;
}

export function ReservationDetail({
  reservationId,
}: ReservationDetailProps) {
  const [
    reservation,
    setReservation,
  ] =
    useState<
      Reservation | null
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
    cancelling,
    setCancelling,
  ] =
    useState(false);

  const [
    showCancelConfirm,
    setShowCancelConfirm,
  ] =
    useState(false);

  const [
    showReschedule,
    setShowReschedule,
  ] =
    useState(false);

  useEffect(
    () => {
      const controller =
        new AbortController();

      getReservationById(
        reservationId,
        controller.signal,
      )
        .then(
          (data) => {
            if (
              !controller
                .signal
                .aborted
            ) {
              setReservation(
                data,
              );

              setError(null);
            }
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
                : "No fue posible cargar la reserva.",
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
      reservationId,
    ],
  );

  async function handleCancelReservation() {
    if (!reservation) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);

      const updated =
        await cancelReservation(
          reservation.id,
        );

      setReservation(
        updated,
      );

      setShowCancelConfirm(
        false,
      );

      setShowReschedule(
        false,
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible cancelar la reserva.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="reservation-loading">
        Cargando reserva...
      </div>
    );
  }

  if (
    error &&
    !reservation
  ) {
    return (
      <div className="catalog-state catalog-state-error">
        <strong>
          No pudimos cargar
          la reserva.
        </strong>

        <p>
          {error}
        </p>

        <Link
          href="/intranet/reservas"
          className="btn btn-outline"
        >
          Volver
        </Link>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  const duration =
    getReservationDurationHours(
      reservation.startAt,
      reservation.endAt,
    );

  const canManage =
    canManageReservation(
      reservation.startAt,
      reservation.status,
    );

  return (
    <>
      <div className="reservation-detail-head">
        <div>
          <div className="eyebrow">
            Reserva #
            {reservation.id}
          </div>

          <h1 className="section-title">
            {
              reservation
                .court
                .name
            }
          </h1>

          <p className="section-subtitle">
            {
              COURT_TYPE_LABELS[
                reservation
                  .court
                  .type
              ]
            }
          </p>
        </div>

        <span
          className={
            `reservation-status reservation-status-large ${
              getReservationStatusClass(
                reservation.status,
              )
            }`
          }
        >
          {
            RESERVATION_STATUS_LABELS[
              reservation.status
            ]
          }
        </span>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error">
          {error}
        </div>
      )}

      <div className="reservation-detail-grid">
        <section className="reservation-detail-card">
          <h2>
            Información de la
            reserva
          </h2>

          <div className="reservation-summary">
            <div>
              <span>
                Inicio
              </span>

              <strong>
                {formatReservationDateTime(
                  reservation.startAt,
                )}
              </strong>
            </div>

            <div>
              <span>
                Fin
              </span>

              <strong>
                {formatReservationDateTime(
                  reservation.endAt,
                )}
              </strong>
            </div>

            <div>
              <span>
                Duración
              </span>

              <strong>
                {duration}{" "}
                {duration === 1
                  ? "hora"
                  : "horas"}
              </strong>
            </div>

            <div>
              <span>
                Total
              </span>

              <strong>
                {formatCourtPrice(
                  reservation.totalPrice,
                )}
              </strong>
            </div>
          </div>

          {reservation.status ===
            "PENDING_PAYMENT" &&
            reservation.expiresAt && (
              <div className="reservation-hold reservation-hold-detail">
                La reserva se
                mantiene temporalmente
                hasta{" "}
                <strong>
                  {formatReservationDateTime(
                    reservation.expiresAt,
                  )}
                </strong>
              </div>
            )}
        </section>

        <aside className="reservation-detail-actions">
          <h2>
            Acciones
          </h2>

          {canManage ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowReschedule(
                    true,
                  );

                  setShowCancelConfirm(
                    false,
                  );
                }}
              >
                Reprogramar
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowCancelConfirm(
                    true,
                  );

                  setShowReschedule(
                    false,
                  );
                }}
              >
                Cancelar reserva
              </button>
            </>
          ) : (
            <p className="muted">
              Esta reserva ya no
              admite modificaciones.
            </p>
          )}

          {reservation.status ===
            "PENDING_PAYMENT" && (
            <div className="reservation-payment-placeholder">
              <strong>
                Pago pendiente
              </strong>

              <span>
                El pago con Mercado
                Pago se habilitará en
                la siguiente fase.
              </span>
            </div>
          )}

          <Link
            href="/intranet/reservas"
            className="btn btn-outline"
          >
            Volver a mis reservas
          </Link>
        </aside>
      </div>

      {showCancelConfirm && (
        <section className="reservation-confirm-panel">
          <div>
            <h2>
              ¿Cancelar esta reserva?
            </h2>

            <p>
              La cancha y el horario
              volverán a quedar
              disponibles.
            </p>
          </div>

          <div className="reservation-action-row">
            <button
              type="button"
              className="btn btn-outline"
              disabled={
                cancelling
              }
              onClick={() =>
                setShowCancelConfirm(
                  false,
                )
              }
            >
              No, volver
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={
                cancelling
              }
              onClick={
                handleCancelReservation
              }
            >
              {cancelling
                ? "Cancelando..."
                : "Sí, cancelar reserva"}
            </button>
          </div>
        </section>
      )}

      {showReschedule && (
        <RescheduleForm
          reservation={
            reservation
          }
          onCancel={() =>
            setShowReschedule(
              false,
            )
          }
          onUpdated={(
            updated,
          ) => {
            setReservation(
              updated,
            );

            setShowReschedule(
              false,
            );
          }}
        />
      )}
    </>
  );
}
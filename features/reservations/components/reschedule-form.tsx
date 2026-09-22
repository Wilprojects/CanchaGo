"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  Reservation,
} from "@/features/reservations/reservation.types";

import {
  rescheduleReservation,
} from "@/features/reservations/reservation.api";

import {
  buildReservationWindow,
  formatHour,
  getAvailableStartHours,
  getLimaToday,
  getReservationDurationHours,
  isPastStartTime,
  type ReservationDuration,
} from "@/features/reservations/reservation.utils";

interface RescheduleFormProps {
  reservation:
    Reservation;

  onUpdated:
    (
      reservation:
        Reservation,
    ) => void;

  onCancel:
    () => void;
}

export function RescheduleForm({
  reservation,
  onUpdated,
  onCancel,
}: RescheduleFormProps) {
  const originalDuration =
    getReservationDurationHours(
      reservation.startAt,
      reservation.endAt,
    );

  const canChangeDuration =
    reservation.status ===
      "PENDING_PAYMENT";

  const initialDuration:
    ReservationDuration =
    originalDuration === 2
      ? 2
      : 1;

  const [
    date,
    setDate,
  ] =
    useState("");

  const [
    duration,
    setDuration,
  ] =
    useState<
      ReservationDuration
    >(
      initialDuration,
    );

  const [
    startHour,
    setStartHour,
  ] =
    useState<
      number | null
    >(null);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const today =
    useMemo(
      () =>
        getLimaToday(),
      [],
    );

  const hours =
    useMemo(
      () =>
        getAvailableStartHours(
          duration,
        ),
      [
        duration,
      ],
    );

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !date ||
      startHour === null
    ) {
      setError(
        "Selecciona una fecha y un horario.",
      );

      return;
    }

    const {
      startAt,
      endAt,
    } =
      buildReservationWindow(
        date,
        startHour,
        duration,
      );

    try {
      setSubmitting(true);
      setError(null);

      const updated =
        await rescheduleReservation(
          reservation.id,
          startAt,
          endAt,
        );

      onUpdated(
        updated,
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible reprogramar la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="reschedule-panel"
      onSubmit={
        handleSubmit
      }
    >
      <div>
        <div className="eyebrow">
          Reprogramación
        </div>

        <h2>
          Selecciona un nuevo
          horario
        </h2>

        {!canChangeDuration && (
          <p className="muted">
            Las reservas
            confirmadas deben
            conservar la duración
            original de{" "}
            {initialDuration}{" "}
            {initialDuration ===
            1
              ? "hora"
              : "horas"}.
          </p>
        )}
      </div>

      {error && (
        <div className="auth-alert auth-alert-error">
          {error}
        </div>
      )}

      <div className="field">
        <label htmlFor="reschedule-date">
          Nueva fecha
        </label>

        <input
          id="reschedule-date"
          type="date"
          className="input"
          min={today}
          value={date}
          onChange={(event) => {
            setDate(
              event
                .target
                .value,
            );

            setStartHour(
              null,
            );
          }}
        />
      </div>

      {canChangeDuration && (
        <div className="field">
          <label>
            Duración
          </label>

          <div className="duration-options">
            <button
              type="button"
              className={
                `duration-option ${
                  duration === 1
                    ? "active"
                    : ""
                }`
              }
              onClick={() => {
                setDuration(1);

                setStartHour(
                  null,
                );
              }}
            >
              1 hora
            </button>

            <button
              type="button"
              className={
                `duration-option ${
                  duration === 2
                    ? "active"
                    : ""
                }`
              }
              onClick={() => {
                setDuration(2);

                setStartHour(
                  null,
                );
              }}
            >
              2 horas
            </button>
          </div>
        </div>
      )}

      <div className="field">
        <label>
          Nuevo horario
        </label>

        {!date ? (
          <p className="muted">
            Primero selecciona
            una fecha.
          </p>
        ) : (
          <div className="time-slot-grid">
            {hours.map(
              (hour) => (
                <button
                  key={hour}
                  type="button"
                  disabled={
                    isPastStartTime(
                      date,
                      hour,
                    )
                  }
                  className={
                    `time-slot ${
                      startHour ===
                      hour
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setStartHour(
                      hour,
                    )
                  }
                >
                  {formatHour(
                    hour,
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <p className="reschedule-note">
        CanchaGo verificará
        nuevamente la
        disponibilidad cuando
        confirmes la
        reprogramación.
      </p>

      <div className="reservation-action-row">
        <button
          type="button"
          className="btn btn-outline"
          disabled={
            submitting
          }
          onClick={
            onCancel
          }
        >
          Volver
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            submitting ||
            !date ||
            startHour ===
              null
          }
        >
          {submitting
            ? "Reprogramando..."
            : "Confirmar reprogramación"}
        </button>
      </div>
    </form>
  );
}
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  getCourtAvailability,
  getCourtById,
} from "@/features/courts/court.api";

import type {
  Court,
  CourtAvailabilityItem,
} from "@/features/courts/court.types";

import {
  COURT_TYPE_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  createReservation,
} from "@/features/reservations/reservation.api";

import type {
  Reservation,
} from "@/features/reservations/reservation.types";

import {
  buildReservationWindow,
  formatHour,
  formatReservationDateTime,
  getAvailableStartHours,
  getLimaToday,
  isPastStartTime,
  type ReservationDuration,
} from "@/features/reservations/reservation.utils";

import {
  ApiClientError,
  isAbortError,
} from "@/lib/api/api-client";

interface ReservationFormProps {
  courtId: number;
}

export function ReservationForm({
  courtId,
}: ReservationFormProps) {
  const [
    court,
    setCourt,
  ] =
    useState<
      Court | null
    >(null);

  const [
    loadingCourt,
    setLoadingCourt,
  ] =
    useState(true);

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
    >(1);

  const [
    startHour,
    setStartHour,
  ] =
    useState<
      number | null
    >(null);

  const [
    availability,
    setAvailability,
  ] =
    useState<
      CourtAvailabilityItem
      | null
    >(null);

  const [
    checking,
    setChecking,
  ] =
    useState(false);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    createdReservation,
    setCreatedReservation,
  ] =
    useState<
      Reservation | null
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
              !controller
                .signal
                .aborted
            ) {
              setCourt(data);
            }
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
                : "No se pudo cargar la cancha.",
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
              setLoadingCourt(
                false,
              );
            }
          },
        );

      return () => {
        controller.abort();
      };
    },
    [courtId],
  );

  function resetAvailability() {
    setAvailability(null);
    setError(null);
  }

  function handleDateChange(
    value: string,
  ) {
    setDate(value);
    setStartHour(null);

    resetAvailability();
  }

  function handleDurationChange(
    value:
      ReservationDuration,
  ) {
    setDuration(value);
    setStartHour(null);

    resetAvailability();
  }

  function handleStartHourChange(
    value: number,
  ) {
    setStartHour(value);

    resetAvailability();
  }

  async function handleCheckAvailability() {
    if (
      !court ||
      !date ||
      startHour === null
    ) {
      setError(
        "Selecciona fecha, duración y horario.",
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
      setChecking(true);
      setError(null);
      setAvailability(null);

      const result =
        await getCourtAvailability({
          startAt,
          endAt,
          type:
            court.type,
        });

      const selectedCourt =
        result.items.find(
          (item) =>
            item.id ===
            court.id,
        );

      if (!selectedCourt) {
        setError(
          "La cancha no está disponible para consultar en este momento.",
        );

        return;
      }

      setAvailability(
        selectedCourt,
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible consultar la disponibilidad.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleCreateReservation() {
    if (
      !court ||
      !availability ||
      !availability.available ||
      !date ||
      startHour === null
    ) {
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
      setCreating(true);
      setError(null);

      const reservation =
        await createReservation({
          courtId:
            court.id,

          startAt,
          endAt,
        });

      setCreatedReservation(
        reservation,
      );

      setAvailability(null);
    } catch (error) {
      if (
        error instanceof
          ApiClientError &&
        error.code ===
          "COURT_NOT_AVAILABLE"
      ) {
        setError(
          "Ese horario acaba de dejar de estar disponible. Selecciona otro horario.",
        );

        setAvailability(null);

        return;
      }

      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible crear la reserva.",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loadingCourt) {
    return (
      <div className="reservation-loading">
        Cargando información
        de la cancha...
      </div>
    );
  }

  if (
    !court
  ) {
    return (
      <div className="catalog-state catalog-state-error">
        <strong>
          Cancha no disponible
        </strong>

        <p>
          {error ??
            "No fue posible cargar la cancha seleccionada."}
        </p>
      </div>
    );
  }

  if (createdReservation) {
    return (
      <section className="reservation-success">
        <div className="reservation-success-icon">
          ✓
        </div>

        <div className="eyebrow">
          Reserva creada
        </div>

        <h1>
          Tu horario está
          reservado temporalmente
        </h1>

        <p>
          La reserva fue creada
          correctamente y está
          pendiente de pago.
        </p>

        <div className="reservation-summary">
          <div>
            <span>
              Cancha
            </span>

            <strong>
              {
                createdReservation
                  .court
                  .name
              }
            </strong>
          </div>

          <div>
            <span>
              Inicio
            </span>

            <strong>
              {formatReservationDateTime(
                createdReservation
                  .startAt,
              )}
            </strong>
          </div>

          <div>
            <span>
              Fin
            </span>

            <strong>
              {formatReservationDateTime(
                createdReservation
                  .endAt,
              )}
            </strong>
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {formatCourtPrice(
                createdReservation
                  .totalPrice,
              )}
            </strong>
          </div>

          <div>
            <span>
              Estado
            </span>

            <strong>
              Pendiente de pago
            </strong>
          </div>
        </div>

        <div className="reservation-success-actions">
          <Link
            href="/intranet/reservas"
            className="btn btn-outline"
          >
            Ver mis reservas
          </Link>

          <span className="muted">
            El pago se integrará
            en la fase de checkout.
          </span>
        </div>
      </section>
    );
  }

  return (
    <div className="booking-layout">
      <section className="booking-form-card">
        <div className="eyebrow">
          Nueva reserva
        </div>

        <h1 className="section-title">
          Selecciona tu horario
        </h1>

        <p className="section-subtitle">
          Elige fecha, duración
          y hora de inicio.
        </p>

        {error && (
          <div
            className="auth-alert auth-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="booking-fields">
          <div className="field">
            <label htmlFor="reservation-date">
              Fecha
            </label>

            <input
              id="reservation-date"
              type="date"
              className="input"
              min={today}
              value={date}
              onChange={(event) =>
                handleDateChange(
                  event
                    .target
                    .value,
                )
              }
            />
          </div>

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
                onClick={() =>
                  handleDurationChange(
                    1,
                  )
                }
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
                onClick={() =>
                  handleDurationChange(
                    2,
                  )
                }
              >
                2 horas
              </button>
            </div>
          </div>

          <div className="field">
            <label>
              Hora de inicio
            </label>

            {!date ? (
              <p className="muted">
                Primero selecciona
                una fecha.
              </p>
            ) : (
              <div className="time-slot-grid">
                {hours.map(
                  (hour) => {
                    const isPast =
                      isPastStartTime(
                        date,
                        hour,
                      );

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={
                          isPast
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
                          handleStartHourChange(
                            hour,
                          )
                        }
                      >
                        {formatHour(
                          hour,
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-dark"
            disabled={
              checking ||
              !date ||
              startHour ===
                null
            }
            onClick={
              handleCheckAvailability
            }
          >
            {checking
              ? "Consultando..."
              : "Consultar disponibilidad"}
          </button>
        </div>

        {availability && (
          <div
            className={
              availability
                .available
                ? "availability-result availability-result-ok"
                : "availability-result availability-result-busy"
            }
          >
            {availability
              .available ? (
              <>
                <strong>
                  Horario disponible
                </strong>

                <span>
                  Puedes reservar
                  esta cancha.
                </span>

                <div className="availability-price">
                  Total:{" "}
                  <strong>
                    {formatCourtPrice(
                      availability
                        .totalPrice,
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    creating
                  }
                  onClick={
                    handleCreateReservation
                  }
                >
                  {creating
                    ? "Creando reserva..."
                    : "Confirmar reserva"}
                </button>
              </>
            ) : (
              <>
                <strong>
                  Horario no disponible
                </strong>

                <span>
                  Selecciona otro
                  horario.
                </span>
              </>
            )}
          </div>
        )}
      </section>

      <aside className="booking-court-card">
        <span className="court-category">
          {
            COURT_TYPE_LABELS[
              court.type
            ]
          }
        </span>

        <h2>
          {court.name}
        </h2>

        <p>
          {court.description}
        </p>

        <div className="booking-court-meta">
          <div>
            <span>
              Capacidad
            </span>

            <strong>
              {court.capacity} personas
            </strong>
          </div>

          <div>
            <span>
              Precio por hora
            </span>

            <strong>
              {formatCourtPrice(
                court.pricePerHour,
              )}
            </strong>
          </div>

          <div>
            <span>
              Duración elegida
            </span>

            <strong>
              {duration}{" "}
              {duration === 1
                ? "hora"
                : "horas"}
            </strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
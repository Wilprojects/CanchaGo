"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  Reservation,
} from "@/features/reservations/reservation.types";

import {
  createPayment,
} from "@/features/payments/payment.api";

import {
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  formatReservationDateTime,
} from "@/features/reservations/reservation.utils";

interface PaymentPanelProps {
  reservation:
    Reservation;
}

export function PaymentPanel({
  reservation,
}: PaymentPanelProps) {
  const [
    redirecting,
    setRedirecting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const expiresAt =
    reservation.expiresAt;

  const [
    secondsLeft,
    setSecondsLeft,
  ] =
    useState<
      number | null
    >(null);

  useEffect(
    () => {
      if (!expiresAt) {
        return;
      }

      const updateCountdown =
        () => {
          const next =
            Math.max(
              0,
              Math.floor(
                (
                  new Date(
                    expiresAt,
                  ).getTime() -
                  Date.now()
                ) /
                  1000,
              ),
            );

          setSecondsLeft(
            next,
          );
        };

      const initialTimer =
        window.setTimeout(
          updateCountdown,
          0,
        );

      const interval =
        window.setInterval(
          updateCountdown,
          1000,
        );

      return () => {
        window.clearTimeout(
          initialTimer,
        );

        window.clearInterval(
          interval,
        );
      };
    },
    [
      expiresAt,
    ],
  );

  const minutes =
    secondsLeft === null
      ? 0
      : Math.floor(
          secondsLeft / 60,
        );

  const seconds =
    secondsLeft === null
      ? 0
      : secondsLeft % 60;

  const expired =
    secondsLeft !== null &&
    secondsLeft <= 0;

  async function handlePayment() {
    try {
      setRedirecting(
        true,
      );

      setError(null);

      const result =
        await createPayment({
          reservationId:
            reservation.id,
        });

      if (!result.checkoutUrl) {
        throw new Error(
          "Mercado Pago no devolvió una URL de checkout.",
        );
      }

      window.location.assign(
        result.checkoutUrl,
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible iniciar el pago.",
      );

      setRedirecting(
        false,
      );
    }
  }

  return (
    <section className="payment-panel">
      <div>
        <div className="eyebrow">
          Pago pendiente
        </div>

        <h2>
          Completa tu reserva
        </h2>

        <p>
          Tu horario está
          reservado temporalmente
          mientras completas el
          pago.
        </p>
      </div>

      <div className="payment-summary">
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

        {expiresAt && (
          <div>
            <span>
              Reserva hasta
            </span>

            <strong>
              {formatReservationDateTime(
                expiresAt,
              )}
            </strong>
          </div>
        )}
      </div>

      {expiresAt && (
        <div
          className={
            expired
              ? "payment-countdown payment-countdown-expired"
              : "payment-countdown"
          }
        >
          {secondsLeft === null ? (
            <>
              <span>
                Tiempo restante
              </span>

              <strong>
                Calculando...
              </strong>
            </>
          ) : expired ? (
            <>
              <strong>
                Tiempo agotado
              </strong>

              <span>
                Actualiza la
                reserva para
                comprobar su
                estado.
              </span>
            </>
          ) : (
            <>
              <span>
                Tiempo restante
              </span>

              <strong>
                {String(
                  minutes,
                ).padStart(
                  2,
                  "0",
                )}
                :
                {String(
                  seconds,
                ).padStart(
                  2,
                  "0",
                )}
              </strong>
            </>
          )}
        </div>
      )}

      {error && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary payment-button"
        disabled={
          redirecting ||
          expired ||
          secondsLeft === null
        }
        onClick={
          handlePayment
        }
      >
        {redirecting
          ? "Abriendo Mercado Pago..."
          : "Pagar con Mercado Pago"}
      </button>

      <p className="payment-security-note">
        La confirmación del pago
        se realiza desde el
        servidor mediante Mercado
        Pago.
      </p>
    </section>
  );
}
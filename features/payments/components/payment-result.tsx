"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  getPaymentByQuotationId,
} from "@/features/payments/payment.api";

import type {
  Payment,
  PaymentResult as PaymentResultType,
} from "@/features/payments/payment.types";

import {
  isPaymentFinal,
  PAYMENT_STATUS_LABELS,
} from "@/features/payments/payment.utils";

import {
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  isAbortError,
} from "@/lib/api/api-client";

interface PaymentResultProps {
  result:
    PaymentResultType;

  quotationId:
    string | null;
}

export function PaymentResult({
  result,
  quotationId,
}: PaymentResultProps) {
  const [
    payment,
    setPayment,
  ] =
    useState<
      Payment | null
    >(null);

  const [
    checking,
    setChecking,
  ] =
    useState(
      Boolean(
        quotationId,
      ),
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(
    () => {
      if (!quotationId) {
        return;
      }

      const controller =
        new AbortController();

      let attempts = 0;

      const maxAttempts =
        10;

      async function checkPayment() {
        try {
          const currentPayment =
            await getPaymentByQuotationId(
              quotationId!,
              controller.signal,
            );

          if (
            controller
              .signal
              .aborted
          ) {
            return;
          }

          setPayment(
            currentPayment,
          );

          setError(null);

          if (
            isPaymentFinal(
              currentPayment.status,
            )
          ) {
            setChecking(
              false,
            );

            return;
          }

          attempts += 1;

          if (
            attempts >=
            maxAttempts
          ) {
            setChecking(
              false,
            );

            return;
          }

          window.setTimeout(
            checkPayment,
            2000,
          );
        } catch (error) {
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
              : "No fue posible consultar el pago.",
          );

          setChecking(
            false,
          );
        }
      }

      void checkPayment();

      return () => {
        controller.abort();
      };
    },
    [
      quotationId,
    ],
  );

  const resultTitle =
    result === "success"
      ? "Procesando resultado del pago"
      : result ===
          "pending"
        ? "Pago pendiente"
        : "El pago no se completó";

  return (
    <section className="payment-result">
      <div
        className={
          `payment-result-icon payment-result-icon-${result}`
        }
      >
        {result ===
        "success"
          ? "✓"
          : result ===
              "pending"
            ? "…"
            : "×"}
      </div>

      <div className="eyebrow">
        Mercado Pago
      </div>

      <h1>
        {resultTitle}
      </h1>

      {checking && (
        <p>
          Estamos verificando el
          estado confirmado por el
          servidor.
        </p>
      )}

      {error && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {payment && (
        <div className="payment-result-summary">
          <div>
            <span>
              Estado
            </span>

            <strong>
              {
                PAYMENT_STATUS_LABELS[
                  payment.status
                ]
              }
            </strong>
          </div>

          <div>
            <span>
              Monto
            </span>

            <strong>
              {formatCourtPrice(
                payment.amount,
              )}
            </strong>
          </div>

          <div>
            <span>
              Operación
            </span>

            <strong>
              {
                payment.quotationId
              }
            </strong>
          </div>
        </div>
      )}

      {payment?.status ===
        "APPROVED" && (
        <div className="payment-result-message payment-result-message-ok">
          <strong>
            Pago confirmado
          </strong>

          <span>
            Tu reserva fue
            confirmada
            correctamente.
          </span>
        </div>
      )}

      {(payment?.status ===
        "PENDING" ||
        payment?.status ===
          "IN_PROCESS") && (
        <div className="payment-result-message">
          <strong>
            Pago en proceso
          </strong>

          <span>
            Mercado Pago todavía
            está procesando la
            operación.
          </span>
        </div>
      )}

      {(payment?.status ===
        "REJECTED" ||
        payment?.status ===
          "CANCELLED") && (
        <div className="payment-result-message payment-result-message-error">
          <strong>
            Pago no aprobado
          </strong>

          <span>
            Puedes volver a la
            reserva e intentarlo
            nuevamente mientras el
            horario siga vigente.
          </span>
        </div>
      )}

      {!quotationId && (
        <div className="payment-result-message">
          <strong>
            Resultado recibido
          </strong>

          <span>
            Consulta Mis reservas
            para verificar el
            estado actualizado.
          </span>
        </div>
      )}

      <div className="payment-result-actions">
        {payment && (
          <Link
            href={
              `/intranet/reservas/${payment.reservationId}`
            }
            className="btn btn-primary"
          >
            Ver reserva
          </Link>
        )}

        <Link
          href="/intranet/reservas"
          className="btn btn-outline"
        >
          Mis reservas
        </Link>
      </div>
    </section>
  );
}
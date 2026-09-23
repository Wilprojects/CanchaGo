"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  getAdminCourts,
} from "@/features/courts/court.api";

import type {
  Court,
} from "@/features/courts/court.types";

import {
  isAbortError,
} from "@/lib/api/api-client";

export function AdminOverview() {
  const [
    courts,
    setCourts,
  ] =
    useState<
      Court[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

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

      getAdminCourts(
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

            setCourts(
              data,
            );

            setError(
              null,
            );
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
                : "No fue posible cargar el resumen administrativo.",
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
      reloadKey,
    ],
  );

  const stats =
    useMemo(
      () => {
        const active =
          courts.filter(
            (court) =>
              court.active,
          ).length;

        const inactive =
          courts.length -
          active;

        const types =
          new Set(
            courts.map(
              (court) =>
                court.type,
            ),
          ).size;

        return {
          total:
            courts.length,

          active,

          inactive,

          types,
        };
      },
      [
        courts,
      ],
    );

  function handleRetry() {
    setLoading(
      true,
    );

    setError(
      null,
    );

    setReloadKey(
      (current) =>
        current + 1,
    );
  }

  if (loading) {
    return (
      <div className="reservation-loading">
        Cargando panel
        administrativo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-state catalog-state-error">
        <strong>
          No pudimos cargar el
          panel administrativo.
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
    );
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="eyebrow">
            Backoffice
          </div>

          <h1 className="section-title">
            Administración de
            CanchaGo
          </h1>

          <p className="section-subtitle">
            Gestiona la oferta de
            canchas de la
            plataforma.
          </p>
        </div>

        <Link
          href="/backoffice/canchas"
          className="btn btn-primary"
        >
          Gestionar canchas
        </Link>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>
            Canchas registradas
          </span>

          <strong>
            {
              stats.total
            }
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Canchas activas
          </span>

          <strong>
            {
              stats.active
            }
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Canchas inactivas
          </span>

          <strong>
            {
              stats.inactive
            }
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Tipos deportivos
          </span>

          <strong>
            {
              stats.types
            }
          </strong>
        </article>
      </div>

      <section className="admin-dashboard-section">
        <div>
          <div className="eyebrow">
            Gestión
          </div>

          <h2>
            Catálogo deportivo
          </h2>

          <p>
            Desde el módulo de
            canchas puedes crear,
            modificar, desactivar
            o reactivar los
            espacios disponibles
            para reservas.
          </p>
        </div>

        <Link
          href="/backoffice/canchas"
          className="btn btn-outline"
        >
          Abrir gestión de canchas
        </Link>
      </section>
    </>
  );
}
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deactivateCourt,
  getAdminCourts,
  updateCourt,
} from "@/features/courts/court.api";

import {
  CourtAdminForm,
} from "@/features/courts/components/court-admin-form";

import type {
  Court,
  CourtType,
} from "@/features/courts/court.types";

import {
  COURT_TYPE_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  isAbortError,
} from "@/lib/api/api-client";

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

export function AdminCourtManager() {
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

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    type,
    setType,
  ] =
    useState<
      CourtType | ""
    >("");

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      "ALL",
    );

  const [
    showForm,
    setShowForm,
  ] =
    useState(
      false,
    );

  const [
    editingCourt,
    setEditingCourt,
  ] =
    useState<
      Court | null
    >(null);

  const [
    busyCourtId,
    setBusyCourtId,
  ] =
    useState<
      number | null
    >(null);

  const [
    confirmDeactivateId,
    setConfirmDeactivateId,
  ] =
    useState<
      number | null
    >(null);

  const [
    actionError,
    setActionError,
  ] =
    useState<
      string | null
    >(null);

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
                : "No fue posible cargar las canchas.",
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

  const filteredCourts =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return courts.filter(
          (court) => {
            const matchesSearch =
              !normalizedSearch ||
              court.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              court.description
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const matchesType =
              !type ||
              court.type ===
                type;

            const matchesStatus =
              status ===
                "ALL" ||
              (
                status ===
                  "ACTIVE" &&
                court.active
              ) ||
              (
                status ===
                  "INACTIVE" &&
                !court.active
              );

            return (
              matchesSearch &&
              matchesType &&
              matchesStatus
            );
          },
        );
      },
      [
        courts,
        search,
        type,
        status,
      ],
    );

  function handleNewCourt() {
    setEditingCourt(
      null,
    );

    setShowForm(
      true,
    );

    setActionError(
      null,
    );
  }

  function handleEdit(
    court:
      Court,
  ) {
    setEditingCourt(
      court,
    );

    setShowForm(
      true,
    );

    setActionError(
      null,
    );
  }

  function handleSaved(
    savedCourt:
      Court,
  ) {
    setCourts(
      (current) => {
        const exists =
          current.some(
            (court) =>
              court.id ===
              savedCourt.id,
          );

        if (!exists) {
          return [
            savedCourt,
            ...current,
          ].sort(
            (
              first,
              second,
            ) =>
              first.name.localeCompare(
                second.name,
                "es",
              ),
          );
        }

        return current.map(
          (court) =>
            court.id ===
            savedCourt.id
              ? savedCourt
              : court,
        );
      },
    );

    setEditingCourt(
      null,
    );

    setShowForm(
      false,
    );
  }

  async function handleDeactivate(
    courtId:
      number,
  ) {
    try {
      setBusyCourtId(
        courtId,
      );

      setActionError(
        null,
      );

      await deactivateCourt(
        courtId,
      );

      setCourts(
        (current) =>
          current.map(
            (court) =>
              court.id ===
              courtId
                ? {
                    ...court,
                    active:
                      false,
                  }
                : court,
          ),
      );

      setConfirmDeactivateId(
        null,
      );
    } catch (error) {
      setActionError(
        error instanceof
          Error
          ? error.message
          : "No fue posible desactivar la cancha.",
      );
    } finally {
      setBusyCourtId(
        null,
      );
    }
  }

  async function handleActivate(
    courtId:
      number,
  ) {
    try {
      setBusyCourtId(
        courtId,
      );

      setActionError(
        null,
      );

      const updated =
        await updateCourt(
          courtId,
          {
            active:
              true,
          },
        );

      setCourts(
        (current) =>
          current.map(
            (court) =>
              court.id ===
              courtId
                ? updated
                : court,
          ),
      );
    } catch (error) {
      setActionError(
        error instanceof
          Error
          ? error.message
          : "No fue posible activar la cancha.",
      );
    } finally {
      setBusyCourtId(
        null,
      );
    }
  }

  function handleReload() {
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

  if (
    loading &&
    courts.length ===
      0
  ) {
    return (
      <div className="reservation-loading">
        Cargando canchas...
      </div>
    );
  }

  if (
    error &&
    courts.length ===
      0
  ) {
    return (
      <div className="catalog-state catalog-state-error">
        <strong>
          No pudimos cargar
          las canchas.
        </strong>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="btn btn-dark"
          onClick={
            handleReload
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
            Administración
          </div>

          <h1 className="section-title">
            Gestión de canchas
          </h1>

          <p className="section-subtitle">
            Crea, edita, activa y
            desactiva las canchas
            disponibles en CanchaGo.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={
            handleNewCourt
          }
        >
          Nueva cancha
        </button>
      </div>

      {showForm && (
        <CourtAdminForm
          key={
            editingCourt
              ? `edit-${editingCourt.id}`
              : "new-court"
          }
          court={
            editingCourt
          }
          onSaved={
            handleSaved
          }
          onCancel={() => {
            setShowForm(
              false,
            );

            setEditingCourt(
              null,
            );
          }}
        />
      )}

      {actionError && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {actionError}
        </div>
      )}

      <div className="admin-toolbar">
        <div className="field admin-search-field">
          <label htmlFor="admin-court-search">
            Buscar
          </label>

          <input
            id="admin-court-search"
            type="search"
            className="input"
            placeholder="Nombre o descripción"
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <div className="field">
          <label htmlFor="admin-court-type">
            Tipo
          </label>

          <select
            id="admin-court-type"
            className="input"
            value={
              type
            }
            onChange={(
              event,
            ) =>
              setType(
                event
                  .target
                  .value as
                  CourtType |
                  "",
              )
            }
          >
            <option value="">
              Todos
            </option>

            <option value="FOOTBALL">
              Fútbol
            </option>

            <option value="PADEL">
              Pádel
            </option>

            <option value="TENNIS">
              Tenis
            </option>

            <option value="BASKETBALL">
              Básquet
            </option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="admin-court-status">
            Estado
          </label>

          <select
            id="admin-court-status"
            className="input"
            value={
              status
            }
            onChange={(
              event,
            ) =>
              setStatus(
                event
                  .target
                  .value as
                  StatusFilter,
              )
            }
          >
            <option value="ALL">
              Todas
            </option>

            <option value="ACTIVE">
              Activas
            </option>

            <option value="INACTIVE">
              Inactivas
            </option>
          </select>
        </div>
      </div>

      <div className="admin-result-summary">
        <span>
          {
            filteredCourts.length
          }{" "}
          {filteredCourts.length ===
          1
            ? "cancha"
            : "canchas"}
        </span>

        {loading && (
          <span>
            Actualizando...
          </span>
        )}
      </div>

      {filteredCourts.length ===
      0 ? (
        <div className="catalog-state">
          <strong>
            No encontramos canchas.
          </strong>

          <p>
            Cambia los filtros o
            registra una nueva
            cancha.
          </p>
        </div>
      ) : (
        <div className="admin-court-list">
          {filteredCourts.map(
            (court) => (
              <article
                key={
                  court.id
                }
                className="admin-court-row"
              >
                <div className="admin-court-main">
                  <div>
                    <span className="court-category">
                      {
                        COURT_TYPE_LABELS[
                          court.type
                        ]
                      }
                    </span>

                    <h2>
                      {
                        court.name
                      }
                    </h2>

                    <p>
                      {
                        court.description
                      }
                    </p>
                  </div>
                </div>

                <div className="admin-court-data">
                  <div>
                    <span>
                      Capacidad
                    </span>

                    <strong>
                      {
                        court.capacity
                      }{" "}
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
                    </strong>
                  </div>

                  <div>
                    <span>
                      Estado
                    </span>

                    <strong
                      className={
                        court.active
                          ? "admin-status admin-status-active"
                          : "admin-status admin-status-inactive"
                      }
                    >
                      {court.active
                        ? "Activa"
                        : "Inactiva"}
                    </strong>
                  </div>
                </div>

                <div className="admin-court-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={
                      busyCourtId ===
                      court.id
                    }
                    onClick={() =>
                      handleEdit(
                        court,
                      )
                    }
                  >
                    Editar
                  </button>

                  {court.active ? (
                    confirmDeactivateId ===
                    court.id ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={
                            busyCourtId ===
                            court.id
                          }
                          onClick={() =>
                            setConfirmDeactivateId(
                              null,
                            )
                          }
                        >
                          Volver
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={
                            busyCourtId ===
                            court.id
                          }
                          onClick={() =>
                            void handleDeactivate(
                              court.id,
                            )
                          }
                        >
                          {busyCourtId ===
                          court.id
                            ? "Desactivando..."
                            : "Confirmar"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() =>
                          setConfirmDeactivateId(
                            court.id,
                          )
                        }
                      >
                        Desactivar
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={
                        busyCourtId ===
                        court.id
                      }
                      onClick={() =>
                        void handleActivate(
                          court.id,
                        )
                      }
                    >
                      {busyCourtId ===
                      court.id
                        ? "Activando..."
                        : "Activar"}
                    </button>
                  )}
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </>
  );
}
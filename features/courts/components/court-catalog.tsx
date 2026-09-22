"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCourts,
} from "@/features/courts/court.api";

import {
  isAbortError,
} from "@/lib/api/api-client";

import type {
  Court,
  CourtPagination,
  CourtType,
} from "@/features/courts/court.types";

import {
  CourtCard,
} from "@/features/courts/components/court-card";

import {
  CourtFilters,
} from "@/features/courts/components/court-filters";

const INITIAL_PAGINATION:
  CourtPagination = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0,
};

export function CourtCatalog() {
  const [
    courts,
    setCourts,
  ] =
    useState<Court[]>(
      [],
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<CourtPagination>(
      INITIAL_PAGINATION,
    );

  const [
    draftSearch,
    setDraftSearch,
  ] =
    useState("");

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

      async function loadCourts() {
        try {
          setLoading(true);
          setError(null);

          const data =
            await getCourts(
              {
                type:
                  type ||
                  undefined,

                search:
                  search ||
                  undefined,

                page,

                limit:
                  9,
              },

              controller
                .signal,
            );

          setCourts(
            data.items,
          );

          setPagination(
            data.pagination,
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
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las canchas.",
          );
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

      void loadCourts();

      return () => {
        controller.abort();
      };
    },
    [
      page,
      search,
      type,
      reloadKey,
    ],
  );

  function handleSearch() {
    setPage(1);

    setSearch(
      draftSearch.trim(),
    );
  }

  function handleTypeChange(
    value:
      CourtType | "",
  ) {
    setPage(1);

    setType(value);
  }

  function handleClear() {
    setDraftSearch("");
    setSearch("");
    setType("");
    setPage(1);
  }

  if (
    loading &&
    courts.length === 0
  ) {
    return (
      <>
        <CourtFilters
          search={
            draftSearch
          }
          type={type}
          onSearchChange={
            setDraftSearch
          }
          onTypeChange={
            handleTypeChange
          }
          onSubmit={
            handleSearch
          }
          onClear={
            handleClear
          }
        />

        <div className="court-grid">
          {Array.from({
            length: 6,
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
                  <div className="skeleton skeleton-line" />
                </div>
              </div>
            ),
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <CourtFilters
        search={
          draftSearch
        }
        type={type}
        onSearchChange={
          setDraftSearch
        }
        onTypeChange={
          handleTypeChange
        }
        onSubmit={
          handleSearch
        }
        onClear={
          handleClear
        }
      />

      {error && (
        <div
          className="catalog-state catalog-state-error"
          role="alert"
        >
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
            onClick={() =>
              setReloadKey(
                (current) =>
                  current +
                  1,
              )
            }
          >
            Reintentar
          </button>
        </div>
      )}

      {!error &&
        courts.length ===
          0 && (
          <div className="catalog-state">
            <strong>
              No encontramos
              canchas.
            </strong>

            <p>
              Prueba cambiando
              el deporte o el
              término de
              búsqueda.
            </p>

            <button
              type="button"
              className="btn btn-soft"
              onClick={
                handleClear
              }
            >
              Limpiar filtros
            </button>
          </div>
        )}

      {!error &&
        courts.length >
          0 && (
          <>
            <div className="catalog-summary">
              <span>
                {pagination.total}{" "}
                {
                  pagination.total ===
                  1
                    ? "cancha encontrada"
                    : "canchas encontradas"
                }
              </span>

              {loading && (
                <span className="catalog-refreshing">
                  Actualizando...
                </span>
              )}
            </div>

            <div className="court-grid">
              {courts.map(
                (court) => (
                  <CourtCard
                    key={
                      court.id
                    }
                    court={
                      court
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
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
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
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        current +
                        1,
                    )
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
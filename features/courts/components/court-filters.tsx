"use client";

import type {
  FormEvent,
} from "react";

import type {
  CourtType,
} from "@/features/courts/court.types";

interface CourtFiltersProps {
  search: string;

  type:
    CourtType | "";

  onSearchChange:
    (value: string) =>
      void;

  onTypeChange:
    (
      value:
        CourtType | "",
    ) => void;

  onSubmit:
    () => void;

  onClear:
    () => void;
}

export function CourtFilters({
  search,
  type,
  onSearchChange,
  onTypeChange,
  onSubmit,
  onClear,
}: CourtFiltersProps) {
  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onSubmit();
  }

  return (
    <form
      className="catalog-toolbar"
      onSubmit={
        handleSubmit
      }
    >
      <div className="catalog-filter-grid">
        <div className="field">
          <label htmlFor="court-search">
            Buscar cancha
          </label>

          <input
            id="court-search"
            type="search"
            className="input"
            value={search}
            placeholder="Nombre o descripción"
            onChange={(event) =>
              onSearchChange(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <div className="field">
          <label htmlFor="court-type">
            Deporte
          </label>

          <select
            id="court-type"
            value={type}
            onChange={(event) =>
              onTypeChange(
                event
                  .target
                  .value as
                    | CourtType
                    | "",
              )
            }
          >
            <option value="">
              Todos los deportes
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

        <div className="catalog-filter-actions">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Buscar
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={
              onClear
            }
          >
            Limpiar
          </button>
        </div>
      </div>
    </form>
  );
}
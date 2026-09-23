"use client";

import {
  useState,
} from "react";

import {
  createCourt,
  updateCourt,
} from "@/features/courts/court.api";

import type {
  Court,
  CourtType,
} from "@/features/courts/court.types";

interface CourtAdminFormProps {
  court?:
    Court | null;

  onSaved:
    (
      court:
        Court,
    ) => void;

  onCancel:
    () => void;
}

const COURT_TYPES:
  {
    value:
      CourtType;

    label:
      string;
  }[] = [
  {
    value:
      "FOOTBALL",

    label:
      "Fútbol",
  },
  {
    value:
      "PADEL",

    label:
      "Pádel",
  },
  {
    value:
      "TENNIS",

    label:
      "Tenis",
  },
  {
    value:
      "BASKETBALL",

    label:
      "Básquet",
  },
];

export function CourtAdminForm({
  court,
  onSaved,
  onCancel,
}: CourtAdminFormProps) {
  const isEditing =
    Boolean(
      court,
    );

  const [
    name,
    setName,
  ] =
    useState(
      court?.name ??
      "",
    );

  const [
    type,
    setType,
  ] =
    useState<CourtType>(
      court?.type ??
        "FOOTBALL",
    );

  const [
    capacity,
    setCapacity,
  ] =
    useState(
      String(
        court?.capacity ??
          "",
      ),
    );

  const [
    pricePerHour,
    setPricePerHour,
  ] =
    useState(
      String(
        court
          ?.pricePerHour ??
          "",
      ),
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      court
        ?.description ??
        "",
    );

  const [
    imageUrl,
    setImageUrl,
  ] =
    useState(
      court
        ?.imageUrl ??
        "",
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedName =
      name.trim();

    const normalizedDescription =
      description.trim();

    const parsedCapacity =
      Number(
        capacity,
      );

    const parsedPrice =
      Number(
        pricePerHour,
      );

    if (
      normalizedName.length <
      2
    ) {
      setError(
        "Ingresa un nombre válido.",
      );

      return;
    }

    if (
      !Number.isInteger(
        parsedCapacity,
      ) ||
      parsedCapacity <= 0
    ) {
      setError(
        "La capacidad debe ser un número entero mayor que cero.",
      );

      return;
    }

    if (
      !Number.isFinite(
        parsedPrice,
      ) ||
      parsedPrice <= 0
    ) {
      setError(
        "El precio por hora debe ser mayor que cero.",
      );

      return;
    }

    if (
      !normalizedDescription
    ) {
      setError(
        "Ingresa una descripción.",
      );

      return;
    }

    try {
      setSubmitting(
        true,
      );

      setError(
        null,
      );

      const payload = {
        name:
          normalizedName,

        type,

        capacity:
          parsedCapacity,

        pricePerHour:
          parsedPrice,

        description:
          normalizedDescription,

        imageUrl:
          imageUrl.trim()
            ? imageUrl.trim()
            : null,
      };

      const savedCourt =
        court
          ? await updateCourt(
              court.id,
              payload,
            )
          : await createCourt(
              payload,
            );

      onSaved(
        savedCourt,
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "No fue posible guardar la cancha.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <section className="admin-form-card">
      <div className="admin-form-heading">
        <div>
          <div className="eyebrow">
            {isEditing
              ? "Editar cancha"
              : "Nueva cancha"}
          </div>

          <h2>
            {isEditing
              ? court?.name
              : "Registrar cancha"}
          </h2>
        </div>

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
          Cerrar
        </button>
      </div>

      {error && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="admin-court-form"
        onSubmit={
          handleSubmit
        }
      >
        <div className="field">
          <label htmlFor="court-name">
            Nombre
          </label>

          <input
            id="court-name"
            className="input"
            type="text"
            value={
              name
            }
            disabled={
              submitting
            }
            onChange={(
              event,
            ) =>
              setName(
                event
                  .target
                  .value,
              )
            }
            placeholder="Ej. Fútbol 7 C"
          />
        </div>

        <div className="admin-form-row">
          <div className="field">
            <label htmlFor="court-type">
              Tipo
            </label>

            <select
              id="court-type"
              className="input"
              value={
                type
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setType(
                  event
                    .target
                    .value as CourtType,
                )
              }
            >
              {COURT_TYPES.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="field">
            <label htmlFor="court-capacity">
              Capacidad
            </label>

            <input
              id="court-capacity"
              className="input"
              type="number"
              min="1"
              step="1"
              value={
                capacity
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setCapacity(
                  event
                    .target
                    .value,
                )
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="court-price">
            Precio por hora
          </label>

          <input
            id="court-price"
            className="input"
            type="number"
            min="0.01"
            step="0.01"
            value={
              pricePerHour
            }
            disabled={
              submitting
            }
            onChange={(
              event,
            ) =>
              setPricePerHour(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <div className="field">
          <label htmlFor="court-description">
            Descripción
          </label>

          <textarea
            id="court-description"
            className="input admin-textarea"
            value={
              description
            }
            disabled={
              submitting
            }
            onChange={(
              event,
            ) =>
              setDescription(
                event
                  .target
                  .value,
              )
            }
            placeholder="Describe brevemente la cancha."
          />
        </div>

        <div className="field">
          <label htmlFor="court-image">
            URL de imagen
          </label>

          <input
            id="court-image"
            className="input"
            type="url"
            value={
              imageUrl
            }
            disabled={
              submitting
            }
            onChange={(
              event,
            ) =>
              setImageUrl(
                event
                  .target
                  .value,
              )
            }
            placeholder="https://..."
          />
        </div>

        <div className="admin-form-actions">
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
            Cancelar
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              submitting
            }
          >
            {submitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear cancha"}
          </button>
        </div>
      </form>
    </section>
  );
}
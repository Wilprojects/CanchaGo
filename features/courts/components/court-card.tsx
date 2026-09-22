import Link from "next/link";

import type {
  Court,
} from "@/features/courts/court.types";

import {
  COURT_TYPE_LABELS,
  COURT_TYPE_SHORT_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

interface CourtCardProps {
  court: Court;
}

export function CourtCard({
  court,
}: CourtCardProps) {
  return (
    <article className="court-card">
      <div
        className={
          `court-card-visual court-card-visual-${court.type.toLowerCase()}`
        }
      >
        <span className="court-sport-mark">
          {
            COURT_TYPE_SHORT_LABELS[
              court.type
            ]
          }
        </span>

        <div className="court-visual-content">
          <span className="court-type-pill">
            {
              COURT_TYPE_LABELS[
                court.type
              ]
            }
          </span>

          <strong>
            {court.name}
          </strong>
        </div>
      </div>

      <div className="court-card-body">
        <div className="court-card-head">
          <div>
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
          </div>

          <span className="court-active-badge">
            Activa
          </span>
        </div>

        <p className="court-description">
          {court.description}
        </p>

        <div className="court-details">
          <div>
            <span>
              Capacidad
            </span>

            <strong>
              {court.capacity}{" "}
              personas
            </strong>
          </div>

          <div>
            <span>
              Desde
            </span>

            <strong>
              {formatCourtPrice(
                court.pricePerHour,
              )}
              /h
            </strong>
          </div>
        </div>

        <div className="court-card-footer">
          <Link
            href={
              `/intranet/reservas/nueva?courtId=${court.id}`
            }
            className="btn btn-primary"
          >
            Reservar cancha
          </Link>
        </div>
      </div>
    </article>
  );
}
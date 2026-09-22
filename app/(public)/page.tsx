import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  Container,
} from "@/components/ui/container";

import {
  FeaturedCourts,
} from "@/features/courts/components/featured-courts";

export default function HomePage() {
  return (
    <Container>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            Reserva fácil y rápida
          </div>

          <h1>
            Tu cancha,
            tu horario,
            tu partido.
          </h1>

          <p>
            Encuentra canchas
            deportivas disponibles,
            reserva en minutos y
            administra tus partidos
            desde un solo lugar.
          </p>

          <div className="hero-actions">
            <ButtonLink
              href="/canchas"
            >
              Ver canchas
            </ButtonLink>

            <ButtonLink
              href="/registro"
              variant="outline"
            >
              Crear cuenta
            </ButtonLink>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <strong>
                4
              </strong>

              <span>
                Deportes
              </span>
            </div>

            <div className="mini-stat">
              <strong>
                Online
              </strong>

              <span>
                Reservas
              </span>
            </div>

            <div className="mini-stat">
              <strong>
                Seguro
              </strong>

              <span>
                Mercado Pago
              </span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <h2>
            Encuentra tu cancha
          </h2>

          <p>
            Selecciona una fecha y
            el deporte que deseas
            practicar.
          </p>

          <div className="quick-search">
            <div className="field">
              <label htmlFor="home-date">
                Fecha
              </label>

              <input
                id="home-date"
                type="date"
                className="input"
              />
            </div>

            <div className="field">
              <label htmlFor="home-sport">
                Deporte
              </label>

              <select
                id="home-sport"
                defaultValue=""
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

            <div className="field full">
              <ButtonLink
                href="/canchas"
              >
                Buscar disponibilidad
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: "36px",
        }}
      >
        <div className="section-head">
          <div>
            <div className="eyebrow">
              CanchaGo
            </div>

            <h2 className="section-title">
              Reserva en pocos pasos
            </h2>

            <p className="section-subtitle">
              Una experiencia simple
              desde la búsqueda hasta
              la confirmación del pago.
            </p>
          </div>
        </div>

        <div className="grid grid-3">
          <article className="card">
            <h3>
              1. Encuentra
            </h3>

            <p className="muted">
              Explora canchas por
              deporte y consulta
              horarios disponibles.
            </p>
          </article>

          <article className="card">
            <h3>
              2. Reserva
            </h3>

            <p className="muted">
              Selecciona cancha,
              fecha y horario para
              crear tu reserva.
            </p>
          </article>

          <article className="card">
            <h3>
              3. Paga
            </h3>

            <p className="muted">
              Completa el pago con
              Mercado Pago y recibe
              la confirmación.
            </p>
          </article>
        </div>
      </section>

      <section
        style={{
          marginTop: "48px",
        }}
      >
        <div className="section-head">
          <div>
            <div className="eyebrow">
              Espacios deportivos
            </div>

            <h2 className="section-title">
              Canchas destacadas
            </h2>

            <p className="section-subtitle">
              Descubre algunos de
              nuestros espacios
              disponibles para
              reservar.
            </p>
          </div>

          <ButtonLink
            href="/canchas"
            variant="outline"
          >
            Ver todas
          </ButtonLink>
        </div>

        <FeaturedCourts />
      </section>
    </Container>
  );
}
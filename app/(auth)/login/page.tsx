import Link from "next/link";

import {
  Container,
} from "@/components/ui/container";

export const metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <Container className="auth-container">
      <section className="auth-shell">
        <div className="auth-side">
          <div>
            <div className="eyebrow">
              Bienvenido
            </div>

            <h1>
              Vuelve al juego.
            </h1>

            <p>
              Inicia sesión para
              administrar tus
              reservas, consultar
              horarios y realizar
              pagos.
            </p>
          </div>

          <p>
            CanchaGo · Reserva
            deportiva inteligente.
          </p>
        </div>

        <div className="auth-form">
          <div className="auth-form-inner">
            <div className="eyebrow">
              Iniciar sesión
            </div>

            <h2 className="section-title">
              Ingresa a CanchaGo
            </h2>

            <p className="section-subtitle">
              Utiliza tu correo y
              contraseña.
            </p>

            <form
              style={{
                marginTop: "28px",
              }}
            >
              <div className="field">
                <label htmlFor="email">
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="usuario@correo.com"
                />
              </div>

              <div
                className="field"
                style={{
                  marginTop:
                    "15px",
                }}
              >
                <label htmlFor="password">
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginTop:
                    "22px",
                }}
              >
                Ingresar
              </button>
            </form>

            <p
              className="muted"
              style={{
                marginTop: "20px",
              }}
            >
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                style={{
                  color:
                    "var(--primary-2)",
                  fontWeight: 800,
                }}
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
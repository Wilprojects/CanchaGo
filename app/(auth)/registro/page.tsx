import Link from "next/link";

import {
  Container,
} from "@/components/ui/container";

export const metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <Container className="auth-container">
      <section className="auth-shell">
        <div className="auth-side">
          <div>
            <div className="eyebrow">
              Únete
            </div>

            <h1>
              Tu próximo partido
              comienza aquí.
            </h1>

            <p>
              Crea tu cuenta para
              reservar canchas,
              administrar tus
              horarios y pagar
              online.
            </p>
          </div>

          <p>
            CanchaGo · Simple,
            rápido y seguro.
          </p>
        </div>

        <div className="auth-form">
          <div className="auth-form-inner">
            <div className="eyebrow">
              Registro
            </div>

            <h2 className="section-title">
              Crear cuenta
            </h2>

            <p className="section-subtitle">
              Completa tus datos
              para comenzar.
            </p>

            <form
              style={{
                marginTop: "28px",
              }}
            >
              <div className="field">
                <label htmlFor="name">
                  Nombre
                </label>

                <input
                  id="name"
                  className="input"
                  placeholder="Tu nombre"
                />
              </div>

              <div
                className="field"
                style={{
                  marginTop:
                    "15px",
                }}
              >
                <label htmlFor="register-email">
                  Correo electrónico
                </label>

                <input
                  id="register-email"
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
                <label htmlFor="register-password">
                  Contraseña
                </label>

                <input
                  id="register-password"
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
                Crear cuenta
              </button>
            </form>

            <p
              className="muted"
              style={{
                marginTop: "20px",
              }}
            >
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                style={{
                  color:
                    "var(--primary-2)",
                  fontWeight: 800,
                }}
              >
                Ingresar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
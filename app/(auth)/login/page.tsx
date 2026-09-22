import {
  Container,
} from "@/components/ui/container";

import {
  LoginForm,
} from "@/features/auth/components/login-form";

export const metadata = {
  title: "Ingresar",
};

interface LoginPageProps {
  searchParams:
    Promise<{
      next?: string;
    }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params =
    await searchParams;

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
            <LoginForm
              nextPath={
                params.next
              }
            />
          </div>
        </div>
      </section>
    </Container>
  );
}
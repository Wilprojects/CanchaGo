import {
  Container,
} from "@/components/ui/container";

import {
  RegisterForm,
} from "@/features/auth/components/register-form";

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
            <RegisterForm />
          </div>
        </div>
      </section>
    </Container>
  );
}
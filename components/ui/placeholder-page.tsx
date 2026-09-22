import {
  PageHeader,
} from "@/components/ui/page-header";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={
          description
        }
      />

      <div className="placeholder">
        <strong>
          Estructura preparada
        </strong>

        <span className="muted">
          Esta pantalla se
          conectará con el
          backend en una de las
          siguientes fases del
          frontend.
        </span>
      </div>
    </>
  );
}
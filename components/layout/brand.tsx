import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="Ir al inicio de CanchaGo"
    >
      <span className="brand-mark">
        CG
      </span>

      <span className="brand-name">
        Cancha<span>Go</span>
      </span>
    </Link>
  );
}
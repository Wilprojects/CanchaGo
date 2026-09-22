import Link from "next/link";

type ButtonVariant = | "primary" | "dark" | "outline" | "soft";

interface ButtonLinkProps {
  href: string;

  children:
    React.ReactNode;

  variant?:
    ButtonVariant;

  size?:
    "normal" | "small";

  className?: string;
}

export function ButtonLink({
  href,
  children,
  variant =
    "primary",
  size =
    "normal",
  className =
    "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={
        [
          "btn",
          `btn-${variant}`,
          size === "small"
            ? "btn-sm"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {children}
    </Link>
  );
}
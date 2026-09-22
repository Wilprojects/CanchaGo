import {
  PublicHeader,
} from "@/components/layout/public-header";

interface AuthLayoutProps {
  children:
    React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <>
      <PublicHeader />

      <main className="page-content">
        {children}
      </main>
    </>
  );
}
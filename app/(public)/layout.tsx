import {
  PublicHeader,
} from "@/components/layout/public-header";

interface PublicLayoutProps {
  children:
    React.ReactNode;
}

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <PublicHeader />

      <main className="page-content">
        {children}
      </main>
    </>
  );
}
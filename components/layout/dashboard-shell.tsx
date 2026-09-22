interface DashboardShellProps {
  sidebar:
    React.ReactNode;

  children:
    React.ReactNode;
}

export function DashboardShell({
  sidebar,
  children,
}: DashboardShellProps) {
  return (
    <div className="shell">
      {sidebar}

      <main>
        {children}
      </main>
    </div>
  );
}
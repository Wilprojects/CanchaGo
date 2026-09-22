"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

interface SidebarLink {
  href: string;
  label: string;
}

interface DashboardSidebarProps {
  title: string;
  meta: string;

  links:
    SidebarLink[];
}

function isActive(
  pathname: string,
  href: string,
) {
  return (
    pathname === href ||
    (
      href !== "/intranet" &&
      href !== "/backoffice" &&
      pathname.startsWith(
        `${href}/`,
      )
    )
  );
}

export function DashboardSidebar({
  title,
  meta,
  links,
}: DashboardSidebarProps) {
  const pathname =
    usePathname();

  return (
    <aside className="sidebar">
      <div className="side-brand">
        {title}
      </div>

      <nav className="side-menu">
        {links.map(
          (link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                `side-link ${
                  isActive(
                    pathname,
                    link.href,
                  )
                    ? "active"
                    : ""
                }`
              }
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>

      <div className="side-meta">
        {meta}
      </div>
    </aside>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "▣" },
  { href: "/users", label: "Users", icon: "⊙", perm: "user:read" },
  { href: "/roles", label: "Roles", icon: "⊞", perm: "role:read" },
  { href: "/audit", label: "Audit", icon: "≣", perm: "audit:read" },
];

export function Nav({ perms }: { perms: string[] }) {
  const path = usePathname();
  const links = LINKS.filter((l) => !l.perm || perms.includes(l.perm));
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-surface-2 text-text"
                : "text-text-dim hover:bg-surface hover:text-text"
            }`}
          >
            <span
              className={`mono text-base ${active ? "text-accent" : "text-muted group-hover:text-text-dim"}`}
            >
              {l.icon}
            </span>
            {l.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}

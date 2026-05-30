"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: BarChart3 },
  { href: "/latihan", label: "Latihan", icon: BookOpenCheck },
  { href: "/riwayat", label: "Riwayat", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const showNav = navItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  if (!showNav) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-1 rounded-[1.75rem] border border-slate-200 bg-white/95 p-2 shadow-[0_-12px_34px_rgba(15,23,42,0.14)] backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-black transition",
                active ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

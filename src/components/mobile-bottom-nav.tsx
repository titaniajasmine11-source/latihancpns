"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, History, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: BarChart3 },
  { href: "/latihan", label: "Latihan", icon: BookOpenCheck },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const showNav = navItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  if (!showNav) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition",
                active ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
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

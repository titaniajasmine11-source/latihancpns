"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function RouteMessageToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const message = searchParams.get("message");

  useEffect(() => {
    if (!message) {
      return;
    }

    toast(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);

  return null;
}

"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border-slate-200 shadow-xl",
          title: "font-bold",
        },
      }}
    />
  );
}

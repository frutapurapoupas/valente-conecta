"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker registrado");
        })
        .catch((err) => {
          console.error("Erro ao registrar Service Worker:", err);
        });
    }
  }, []);

  return null;
}
"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (!mounted) return;

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
            }
          });
        });
      } catch (error) {
        console.error("Erro ao registrar o service worker:", error);
      }
    }

    registerServiceWorker();

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  return null;
}
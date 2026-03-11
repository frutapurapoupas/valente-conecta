"use client";

import { useEffect } from "react";

const SW_VERSION = "20260311-01";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register(
          `/sw.js?v=${SW_VERSION}`
        );

        if (!mounted) return;

        async function forceUpdateIfWaiting() {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        }

        await forceUpdateIfWaiting();

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

        await registration.update();
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
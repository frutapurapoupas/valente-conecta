"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export default function HealthNotificationBell() {
  const [hasNotifications, setHasNotifications] = useState(false);
  
  useEffect(() => {
    const alertas = localStorage.getItem("academia_alertas_config");
    if (alertas) {
      const config = JSON.parse(alertas);
      setHasNotifications(config.pushAtivo);
    }
  }, []);

  return (
    <button className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
      {hasNotifications ? (
        <>
          <Bell className="w-5 h-5 text-yellow-400" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <BellOff className="w-5 h-5 text-zinc-400" />
      )}
    </button>
  );
}

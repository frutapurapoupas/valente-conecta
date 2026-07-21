import { useState, useEffect } from "react";
export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if ("geolocation" in navigator) { navigator.geolocation.getCurrentPosition((pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); }, () => setLoading(false)); } else setLoading(false); }, []);
  return { location, loading };
}


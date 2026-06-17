import { useEffect, useState } from "react";

export type DetectedLocation = {
  city: string;
  area?: string;
  source: "gps" | "ip" | "fallback" | "manual";
};

const FALLBACK: DetectedLocation = { city: "Bengaluru", source: "fallback" };
const CACHE_KEY = "ayn.location";

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; area?: string } | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (!res.ok) return null;
    const j = await res.json();
    const city = j.city || j.locality || j.principalSubdivision;
    if (!city) return null;
    return { city, area: j.locality && j.locality !== city ? j.locality : undefined };
  } catch {
    return null;
  }
}

async function ipLookup(): Promise<{ city: string } | null> {
  try {
    const r = await fetch("https://ipapi.co/json/");
    if (!r.ok) return null;
    const j = await r.json();
    if (j.city) return { city: j.city };
    return null;
  } catch {
    return null;
  }
}

export function useDetectedLocation() {
  const [loc, setLoc] = useState<DetectedLocation>(FALLBACK);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as DetectedLocation;
        setLoc(parsed);
        if (parsed.source !== "fallback") return;
      }
    } catch {}

    const run = async () => {
      setDetecting(true);
      let result: DetectedLocation | null = null;

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        const gps = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
          const timer = setTimeout(() => resolve(null), 4000);
          navigator.geolocation.getCurrentPosition(
            (p) => { clearTimeout(timer); resolve({ lat: p.coords.latitude, lon: p.coords.longitude }); },
            () => { clearTimeout(timer); resolve(null); },
            { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 },
          );
        });
        if (gps) {
          const geo = await reverseGeocode(gps.lat, gps.lon);
          if (geo) result = { ...geo, source: "gps" };
        }
      }

      if (!result) {
        const ip = await ipLookup();
        if (ip) result = { ...ip, source: "ip" };
      }

      if (cancelled) return;
      const final = result ?? FALLBACK;
      setLoc(final);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(final)); } catch {}
      setDetecting(false);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const setManual = (city: string) => {
    const next: DetectedLocation = { city, source: "manual" };
    setLoc(next);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
  };

  return { location: loc, detecting, setManual };
}

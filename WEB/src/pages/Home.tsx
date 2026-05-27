import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

declare global { interface Window { google: any; initMap: () => void; } }

type RiskPin = { id: number; lat: number; lng: number; type: "flood"|"landslide"|"storm"; title: string; description: string; severity: "high"|"medium"|"low" };

const MOCK_PINS: RiskPin[] = [
  { id: 1, lat: -23.5505, lng: -46.6333, type: "flood",     title: "Enchente — Av. Paulista",      description: "Nível da água subindo rapidamente. Evite a região.",          severity: "high"   },
  { id: 2, lat: -23.5605, lng: -46.6533, type: "landslide", title: "Desabamento — Vila Madalena",  description: "Risco de deslizamento após chuvas intensas nas últimas 24h.", severity: "high"   },
  { id: 3, lat: -23.5405, lng: -46.6133, type: "storm",     title: "Chuva Forte — Centro",         description: "Tempestade com raios e ventos de até 80 km/h.",               severity: "medium" },
];

const PIN_COLORS  = { flood: "#2563eb", landslide: "#b45309", storm: "#7c3aed" };
const SEV_COLORS  = { high: "#dc2626",  medium: "#d97706",    low: "#16a34a"   };
const SEV_LABELS  = { high: "Alto",     medium: "Médio",      low: "Baixo"     };
const TYPE_LABELS = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade" };
const TYPE_ICONS  = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill" };
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

export default function Home() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedPin, setSelectedPin] = useState<RiskPin | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: -23.5505, lng: -46.6333 })
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const loadMap = () => {
      if (!mapRef.current || !window.google) return;
      const map = new window.google.maps.Map(mapRef.current, { center: userLocation, zoom: 13, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
      mapInstanceRef.current = map;
      new window.google.maps.Marker({ position: userLocation, map, title: "Você está aqui", icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: P.lime, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
      MOCK_PINS.forEach((pin) => {
        const marker = new window.google.maps.Marker({ position: { lat: pin.lat, lng: pin.lng }, map, title: pin.title, icon: { path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 8, fillColor: PIN_COLORS[pin.type], fillOpacity: 1, strokeColor: "#fff", strokeWeight: 1 } });
        marker.addListener("click", () => setSelectedPin(pin));
      });
    };
    if (window.google) { loadMap(); }
    else {
      window.initMap = loadMap;
      if (!document.getElementById("google-maps-script")) {
        const s = document.createElement("script");
        s.id = "google-maps-script";
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
        s.async = true; s.defer = true;
        document.head.appendChild(s);
      }
    }
  }, [userLocation]);

  const filtered = MOCK_PINS.filter((p) => search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />

      {/* Search bar */}
      <div style={{ background: P.teal, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 480 }}>
          <i className="bi bi-search" style={{ color: P.lime, fontSize: 15 }} />
          <input
            style={{ background: "transparent", border: "none", outline: "none", color: P.cream, fontSize: 14, width: "100%", fontFamily: "'Nunito', sans-serif" }}
            placeholder="Buscar área de risco..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button style={actionBtn} onClick={() => navigate("/report")}>
          <i className="bi bi-megaphone-fill" /> Denunciar
        </button>
      </div>

      {/* Map */}
      <div style={{ position: "relative", width: "100%", height: "52vh", minHeight: 260, background: P.teal }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        {!window.google && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: P.teal, flexDirection: "column", gap: 8 }}>
            <i className="bi bi-map-fill" style={{ fontSize: 48, color: P.lime, opacity: 0.5 }} />
            <p style={{ color: P.cream, opacity: 0.6, fontSize: 13, textAlign: "center" }}>Mapa carregando...<br /><small>Configure a chave da API do Google Maps em Home.tsx</small></p>
          </div>
        )}
        {selectedPin && (
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: P.cream, borderRadius: 12, padding: "14px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", borderLeft: `5px solid ${PIN_COLORS[selectedPin.type]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 11, color: PIN_COLORS[selectedPin.type], fontWeight: 700, textTransform: "uppercase" }}>{TYPE_LABELS[selectedPin.type]}</span>
                <p style={{ margin: "2px 0 4px", fontWeight: 800, color: P.dark, fontSize: 15 }}>{selectedPin.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: P.teal }}>{selectedPin.description}</p>
              </div>
              <button onClick={() => setSelectedPin(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.teal, fontSize: 18, padding: 0 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pin list + side actions */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: "36vh" }}>
          {filtered.length === 0 && <p style={{ color: P.cream, opacity: 0.5, fontSize: 13 }}>Nenhuma área encontrada.</p>}
          {filtered.map((pin) => (
            <div key={pin.id}
              style={{ background: selectedPin?.id === pin.id ? P.cream : "#2a1228", borderRadius: 10, padding: "12px 14px", cursor: "pointer", borderLeft: `4px solid ${PIN_COLORS[pin.type]}`, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "background 0.2s" }}
              onClick={() => { setSelectedPin(pin); mapInstanceRef.current?.panTo({ lat: pin.lat, lng: pin.lng }); }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i className={`bi ${TYPE_ICONS[pin.type]}`} style={{ color: PIN_COLORS[pin.type], fontSize: 14 }} />
                  <span style={{ fontSize: 11, color: PIN_COLORS[pin.type], fontWeight: 700, textTransform: "uppercase" }}>{TYPE_LABELS[pin.type]}</span>
                </div>
                <span style={{ background: SEV_COLORS[pin.severity], color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{SEV_LABELS[pin.severity]}</span>
              </div>
              <strong style={{ fontSize: 13, color: selectedPin?.id === pin.id ? P.dark : P.cream, display: "block", marginBottom: 2 }}>{pin.title}</strong>
              <p style={{ fontSize: 12, color: selectedPin?.id === pin.id ? P.teal : "#9ca3af", margin: 0, lineHeight: 1.4 }}>{pin.description}</p>
            </div>
          ))}
        </div>

        {/* Side actions */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "12px 10px", background: P.teal, alignItems: "center" }}>
          {[
            { icon: "bi-info-circle-fill", label: "Legenda",    path: "/legend"  },
            { icon: "bi-clipboard2-data-fill", label: "Relatórios", path: "/reports" },
          ].map((item) => (
            <button key={item.path} style={sideBtn} onClick={() => navigate(item.path)}>
              <i className={`bi ${item.icon}`} style={{ fontSize: 20, color: P.lime }} />
              <span style={{ fontSize: 10, color: P.cream, opacity: 0.8 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: `linear-gradient(135deg, ${P.green}, ${P.lime})`,
  color: P.dark, border: "none", borderRadius: 8, padding: "8px 14px",
  fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800,
  cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
};
const sideBtn: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10,
  padding: "10px 12px", cursor: "pointer", minWidth: 58, transition: "background 0.2s",
};

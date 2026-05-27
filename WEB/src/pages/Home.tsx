import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "./Navbar";
import { api } from "../api";

// Fix ícone padrão do Leaflet com Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41], popupAnchor: [1, -34] });

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const SEV_COLOR  = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" } as Record<string, string>;
const SEV_LABEL  = { high: "Alto",    medium: "Médio",   low: "Baixo"  } as Record<string, string>;
const TYPE_LABEL = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade", other: "Outro" } as Record<string, string>;
const TYPE_ICON  = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill", other: "bi-exclamation-triangle-fill" } as Record<string, string>;
// Raio do círculo em metros por nível de risco
const SEV_RADIUS = { high: 800, medium: 500, low: 300 } as Record<string, number>;

type Denuncia = {
  id: number; tipoDenuncia: string; nivelRisco: string;
  cep: string; descricao: string; statusDenuncia: string; dataCriacao: string;
};
type PinData = Denuncia & { lat: number; lng: number; bairro: string; cidade: string };

// Componente que centraliza o mapa na localização do usuário
function RecenterMap({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 13); }, [pos, map]);
  return null;
}

// Ícone SVG customizado por nível de risco
function makeIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
    <path filter="url(#s)" d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg, className: "", iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38],
  });
}

export default function Home() {
  const navigate = useNavigate();
  const [pins, setPins] = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number]>([-15.7801, -47.9292]); // Brasília fallback
  const [selected, setSelected] = useState<PinData | null>(null);
  const [search, setSearch] = useState("");
  // Cache de geocodificação para não repetir chamadas
  const geoCache = useRef<Record<string, { lat: number; lng: number; bairro: string; cidade: string }>>({});

  // Pega localização do usuário
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  // Carrega denúncias e geocodifica CEPs
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const denuncias: Denuncia[] = await api.listarDenuncias();
        const results: PinData[] = [];

        for (const d of denuncias) {
          if (!d.cep || d.cep.length !== 8) continue;
          try {
            if (!geoCache.current[d.cep]) {
              geoCache.current[d.cep] = await api.geocodificarCep(d.cep);
            }
            const geo = geoCache.current[d.cep];
            results.push({ ...d, ...geo });
          } catch {
            // CEP sem coordenadas — ignora
          }
        }
        setPins(results);
      } catch {
        setPins([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = pins.filter((p) =>
    search === "" ||
    (TYPE_LABEL[p.tipoDenuncia] || "").toLowerCase().includes(search.toLowerCase()) ||
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    p.bairro?.toLowerCase().includes(search.toLowerCase()) ||
    p.cidade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Search + action bar */}
      <div style={{ background: "rgba(51,79,83,0.7)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <div className="field" style={{ flex: 1, maxWidth: 500, background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }}>
          <i className="bi bi-search" style={{ color: P.lime }} />
          <input
            style={{ color: P.cream, background: "transparent" }}
            placeholder="Buscar por tipo, bairro ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(229,234,212,0.4)", cursor: "pointer", padding: 0, fontSize: 14 }}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/report")}>
          <i className="bi bi-megaphone-fill" /> <span className="hide-mobile">Denunciar</span>
        </button>
      </div>

      {/* Mapa Leaflet */}
      <div style={{ position: "relative", width: "100%", height: "54vh", minHeight: 280, zIndex: 0 }}>
        <MapContainer
          center={userPos}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          <RecenterMap pos={userPos} />

          {/* Marcador do usuário */}
          <Marker position={userPos} icon={L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:${P.lime};border:3px solid white;box-shadow:0 0 0 4px rgba(154,204,119,0.3)"></div>`,
            className: "", iconSize: [16, 16], iconAnchor: [8, 8],
          })}>
            <Popup><strong>Você está aqui</strong></Popup>
          </Marker>

          {/* Pins + círculos das denúncias */}
          {filtered.map((pin) => {
            const color = SEV_COLOR[pin.nivelRisco] || "#64748b";
            const radius = SEV_RADIUS[pin.nivelRisco] || 400;
            const tipo = pin.tipoDenuncia || "other";
            return (
              <div key={pin.id}>
                {/* Círculo de área de risco */}
                <Circle
                  center={[pin.lat, pin.lng]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 2,
                    opacity: 0.7,
                    dashArray: pin.statusDenuncia === "resolvido" ? "6 4" : undefined,
                  }}
                  eventHandlers={{ click: () => setSelected(pin) }}
                />
                {/* Marcador central */}
                <Marker
                  position={[pin.lat, pin.lng]}
                  icon={makeIcon(color)}
                  eventHandlers={{ click: () => setSelected(pin) }}
                >
                  <Popup>
                    <div style={{ fontFamily: "'Nunito', sans-serif", minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ background: color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>
                          {SEV_LABEL[pin.nivelRisco] || pin.nivelRisco}
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                          {TYPE_LABEL[tipo] || tipo}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{pin.descricao}</p>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        <i className="bi bi-geo-alt-fill" /> {pin.bairro} — {pin.cidade}
                      </div>
                      <button
                        onClick={() => navigate(`/denuncia/${pin.id}`)}
                        style={{ marginTop: 8, width: "100%", padding: "7px", background: P.green, color: "#fff", border: "none", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                      >
                        Ver detalhes →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(31,10,29,0.85)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "8px 18px", display: "flex", alignItems: "center", gap: 8, zIndex: 1000, color: P.cream, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            <i className="bi bi-hourglass-split spin" style={{ color: P.lime }} /> Carregando denúncias...
          </div>
        )}

        {/* Legenda de cores */}
        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(31,10,29,0.88)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 14px", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {[
            { label: "Alto",  color: "#ef4444" },
            { label: "Médio", color: "#f59e0b" },
            { label: "Baixo", color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}88` }} />
              <span style={{ fontSize: 11, color: P.cream, fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 20, height: 2, background: "#9ca3af", borderTop: "2px dashed #9ca3af" }} />
            <span style={{ fontSize: 10, color: P.cream, opacity: 0.5 }}>Resolvido</span>
          </div>
        </div>
      </div>

      {/* Painel inferior */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Lista de denúncias */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: "34vh" }}>

          {loading && [1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: P.cream, opacity: 0.4 }}>
              <i className="bi bi-map" style={{ fontSize: 28, display: "block", marginBottom: 6 }} />
              <span style={{ fontSize: 13 }}>Nenhuma denúncia no mapa</span>
            </div>
          )}

          {!loading && filtered.map((pin) => {
            const color = SEV_COLOR[pin.nivelRisco] || "#64748b";
            const tipo = pin.tipoDenuncia || "other";
            const active = selected?.id === pin.id;
            return (
              <div key={pin.id}
                style={{ background: active ? P.cream : "rgba(42,18,40,0.85)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", borderLeft: `4px solid ${color}`, border: `1px solid ${active ? color : "rgba(255,255,255,0.06)"}`, borderLeftWidth: 4, transition: "all 0.18s" }}
                onClick={() => setSelected(active ? null : pin)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <i className={`bi ${TYPE_ICON[tipo] || TYPE_ICON.other}`} style={{ color, fontSize: 13 }} />
                    <span style={{ fontSize: 11, color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>{TYPE_LABEL[tipo] || tipo}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{ background: color, color: "#fff", borderRadius: 5, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>{SEV_LABEL[pin.nivelRisco] || pin.nivelRisco}</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 3px", fontSize: 12, color: active ? P.dark : P.cream, fontWeight: 700, lineHeight: 1.3 }}>
                  {pin.bairro ? `${pin.bairro} — ${pin.cidade}` : `CEP ${pin.cep}`}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: active ? P.teal : "rgba(229,234,212,0.45)", lineHeight: 1.3 }}>
                  {pin.descricao.length > 70 ? pin.descricao.slice(0, 70) + "…" : pin.descricao}
                </p>
              </div>
            );
          })}
        </div>

        {/* Ações laterais */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "10px 8px", background: "rgba(51,79,83,0.5)", borderLeft: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
          {[
            { icon: "bi-info-circle-fill",     label: "Legenda",    path: "/legend"  },
            { icon: "bi-clipboard2-data-fill",  label: "Relatórios", path: "/reports" },
          ].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 10px", cursor: "pointer", minWidth: 56, transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(154,204,119,0.12)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(154,204,119,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: 20, color: P.lime }} />
              <span style={{ fontSize: 10, color: P.cream, opacity: 0.7, fontWeight: 700 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CSS do Leaflet — sobrescreve z-index para não conflitar com navbar */}
      <style>{`
        .leaflet-top, .leaflet-bottom { z-index: 500 !important; }
        .leaflet-pane { z-index: 400 !important; }
        .leaflet-popup-content { font-family: 'Nunito', sans-serif; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
}

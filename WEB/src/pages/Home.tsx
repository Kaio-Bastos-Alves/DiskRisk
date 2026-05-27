import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "./Navbar";
import { api } from "../api";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41], popupAnchor: [1, -34] });

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const SEV_COLOR: Record<string, string> = { high: "#ef4444", alto: "#ef4444", medium: "#f59e0b", medio: "#f59e0b", low: "#22c55e", baixo: "#22c55e" };
const SEV_LABEL: Record<string, string> = { high: "Alto", alto: "Alto", medium: "Medio", medio: "Medio", low: "Baixo", baixo: "Baixo" };
const SEV_RADIUS: Record<string, number> = { high: 800, alto: 800, medium: 500, medio: 500, low: 300, baixo: 300 };
const TYPE_LABEL: Record<string, string> = {
  flood: "Enchente",
  enchente: "Enchente",
  landslide: "Desabamento/Deslizamento",
  "desabamento/deslizamento": "Desabamento/Deslizamento",
  storm: "Chuva forte/Tempestade",
  "chuva forte/tempestade": "Chuva forte/Tempestade",
  other: "Outro",
  outro: "Outro",
};
const TYPE_ICON: Record<string, string> = {
  flood: "bi-water",
  enchente: "bi-water",
  landslide: "bi-triangle-fill",
  "desabamento/deslizamento": "bi-triangle-fill",
  storm: "bi-cloud-lightning-rain-fill",
  "chuva forte/tempestade": "bi-cloud-lightning-rain-fill",
  other: "bi-exclamation-triangle-fill",
  outro: "bi-exclamation-triangle-fill",
};

type Denuncia = {
  id: number;
  tipoDenuncia: string;
  nivelRisco: string;
  cep: string;
  descricao: string;
  statusDenuncia: string;
  dataCriacao: string;
  fotoDenuncia?: string | null;
};
type PinData = Denuncia & { lat: number; lng: number; bairro: string; cidade: string };

function normalize(value?: string | null) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function RecenterMap({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 13); }, [pos, map]);
  return null;
}

function makeIcon(color: string, image?: string | null) {
  if (image) {
    return L.divIcon({
      html: `<div style="width:42px;height:42px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);overflow:hidden;border:3px solid ${color};box-shadow:0 4px 14px rgba(0,0,0,.35);background:#fff"><img src="${image}" style="width:100%;height:100%;object-fit:cover;transform:rotate(45deg) scale(1.35)" /></div>`,
      className: "",
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -40],
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
    <path filter="url(#s)" d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38] });
}

export default function Home() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [pins, setPins] = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number]>([-15.7801, -47.9292]);
  const [selected, setSelected] = useState<PinData | null>(null);
  const [search, setSearch] = useState("");
  const geoCache = useRef<Record<string, { lat: number; lng: number; bairro: string; cidade: string }>>({});

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data: Denuncia[] = await api.listarDenuncias();
        setDenuncias(data);

        const geocoded = await Promise.all(data.map(async (d) => {
          const cep = (d.cep || "").replace(/\D/g, "");
          if (cep.length !== 8) return null;
          try {
            if (!geoCache.current[cep]) geoCache.current[cep] = await api.geocodificarCep(cep);
            return { ...d, cep, ...geoCache.current[cep] };
          } catch {
            return null;
          }
        }));
        setPins(geocoded.filter(Boolean) as PinData[]);
      } catch {
        setDenuncias([]);
        setPins([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDenuncias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return denuncias;
    return denuncias.filter((d) =>
      (TYPE_LABEL[normalize(d.tipoDenuncia)] || d.tipoDenuncia || "").toLowerCase().includes(term) ||
      (SEV_LABEL[normalize(d.nivelRisco)] || d.nivelRisco || "").toLowerCase().includes(term) ||
      d.descricao.toLowerCase().includes(term) ||
      d.cep.includes(term)
    );
  }, [denuncias, search]);

  const filteredPins = useMemo(() => {
    const ids = new Set(filteredDenuncias.map((d) => d.id));
    return pins.filter((p) => ids.has(p.id));
  }, [filteredDenuncias, pins]);

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ background: "rgba(51,79,83,0.7)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <div className="field" style={{ flex: 1, maxWidth: 500, background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }}>
          <i className="bi bi-search" style={{ color: P.lime }} />
          <input style={{ color: P.cream, background: "transparent" }} placeholder="Buscar por tipo, CEP ou risco..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(229,234,212,0.4)", cursor: "pointer", padding: 0, fontSize: 14 }}><i className="bi bi-x-lg" /></button>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/report")}>
          <i className="bi bi-megaphone-fill" /> <span className="hide-mobile">Denunciar</span>
        </button>
      </div>

      <div style={{ position: "relative", width: "100%", height: "54vh", minHeight: 280, zIndex: 0 }}>
        <MapContainer center={userPos} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl attributionControl>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19} />
          <RecenterMap pos={userPos} />

          <Marker position={userPos} icon={L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:${P.lime};border:3px solid white;box-shadow:0 0 0 4px rgba(154,204,119,0.3)"></div>`,
            className: "", iconSize: [16, 16], iconAnchor: [8, 8],
          })}>
            <Popup><strong>Voce esta aqui</strong></Popup>
          </Marker>

          {filteredPins.map((pin) => {
            const risk = normalize(pin.nivelRisco);
            const type = normalize(pin.tipoDenuncia);
            const color = SEV_COLOR[risk] || "#64748b";
            return (
              <div key={pin.id}>
                <Circle center={[pin.lat, pin.lng]} radius={SEV_RADIUS[risk] || 400} pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 2, opacity: 0.7, dashArray: normalize(pin.statusDenuncia) === "resolvido" ? "6 4" : undefined }} eventHandlers={{ click: () => navigate(`/denuncia/${pin.id}`) }} />
                <Marker
                  position={[pin.lat, pin.lng]}
                  icon={makeIcon(color, pin.fotoDenuncia)}
                  eventHandlers={{ click: () => navigate(`/denuncia/${pin.id}`) }}
                  title={`Denuncia #${pin.id} - CEP ${pin.cep}`}
                >
                  <Popup>
                    <div style={{ fontFamily: "'Nunito', sans-serif", minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ background: color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{SEV_LABEL[risk] || pin.nivelRisco}</span>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{TYPE_LABEL[type] || pin.tipoDenuncia}</span>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{pin.descricao}</p>
                      <div style={{ fontSize: 11, color: "#64748b" }}><i className="bi bi-geo-alt-fill" /> {pin.bairro || `CEP ${pin.cep}`} {pin.cidade ? `- ${pin.cidade}` : ""}</div>
                      <button onClick={() => navigate(`/denuncia/${pin.id}`)} style={{ marginTop: 8, width: "100%", padding: "7px", background: P.green, color: "#fff", border: "none", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Ver detalhes</button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>

        {loading && (
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(31,10,29,0.85)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "8px 18px", display: "flex", alignItems: "center", gap: 8, zIndex: 1000, color: P.cream, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            <i className="bi bi-hourglass-split spin" style={{ color: P.lime }} /> Carregando denuncias...
          </div>
        )}

        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(31,10,29,0.88)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 14px", zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {[{ label: "Alto", color: "#ef4444" }, { label: "Medio", color: "#f59e0b" }, { label: "Baixo", color: "#22c55e" }].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}88` }} />
              <span style={{ fontSize: 11, color: P.cream, fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: "34vh" }}>
          {loading && [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}

          {!loading && filteredDenuncias.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: P.cream, opacity: 0.4 }}>
              <i className="bi bi-map" style={{ fontSize: 28, display: "block", marginBottom: 6 }} />
              <span style={{ fontSize: 13 }}>Nenhuma denuncia encontrada</span>
            </div>
          )}

          {!loading && filteredDenuncias.map((denuncia) => {
            const pin = pins.find((p) => p.id === denuncia.id);
            const risk = normalize(denuncia.nivelRisco);
            const type = normalize(denuncia.tipoDenuncia);
            const color = SEV_COLOR[risk] || "#64748b";
            const active = selected?.id === denuncia.id;
            return (
              <div key={denuncia.id} style={{ background: active ? P.cream : "rgba(42,18,40,0.85)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", borderLeft: `4px solid ${color}`, border: `1px solid ${active ? color : "rgba(255,255,255,0.06)"}`, borderLeftWidth: 4, transition: "all 0.18s" }} onClick={() => navigate(`/denuncia/${denuncia.id}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <i className={`bi ${TYPE_ICON[type] || TYPE_ICON.other}`} style={{ color, fontSize: 13 }} />
                    <span style={{ fontSize: 11, color, fontWeight: 800, textTransform: "uppercase" }}>{TYPE_LABEL[type] || denuncia.tipoDenuncia}</span>
                  </div>
                  <span style={{ background: color, color: "#fff", borderRadius: 5, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>{SEV_LABEL[risk] || denuncia.nivelRisco}</span>
                </div>
                <p style={{ margin: "0 0 3px", fontSize: 12, color: active ? P.dark : P.cream, fontWeight: 700, lineHeight: 1.3 }}>{pin ? `${pin.bairro || `CEP ${pin.cep}`} ${pin.cidade ? `- ${pin.cidade}` : ""}` : `CEP ${denuncia.cep}`}</p>
                <p style={{ margin: 0, fontSize: 11, color: active ? P.teal : "rgba(229,234,212,0.45)", lineHeight: 1.3 }}>{denuncia.descricao.length > 70 ? `${denuncia.descricao.slice(0, 70)}...` : denuncia.descricao}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "10px 8px", background: "rgba(51,79,83,0.5)", borderLeft: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
          {[{ icon: "bi-info-circle-fill", label: "Legenda", path: "/legend" }, { icon: "bi-clipboard2-data-fill", label: "Relatorios", path: "/reports" }].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 10px", cursor: "pointer", minWidth: 56 }}>
              <i className={`bi ${item.icon}`} style={{ fontSize: 20, color: P.lime }} />
              <span style={{ fontSize: 10, color: P.cream, opacity: 0.7, fontWeight: 700 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

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

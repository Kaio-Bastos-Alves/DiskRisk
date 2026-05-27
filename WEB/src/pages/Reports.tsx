import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const TYPE_LABEL: Record<string, string> = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade", other: "Outro" };
const TYPE_ICON:  Record<string, string> = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill", other: "bi-exclamation-triangle-fill" };
const TYPE_COLOR: Record<string, string> = { flood: "#2563eb", landslide: "#b45309", storm: "#7c3aed", other: "#64748b" };
const SEV_COLOR:  Record<string, string> = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };
const SEV_LABEL:  Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" };
const STATUS_COLOR: Record<string, string> = { pendente: "#d97706", "em andamento": "#2563eb", resolvido: "#16a34a" };
const STATUS_ICON:  Record<string, string> = { pendente: "bi-clock-fill", "em andamento": "bi-arrow-repeat", resolvido: "bi-check-circle-fill" };

type Denuncia = { id: number; tipoDenuncia: string; nivelRisco: string; cep: string; descricao: string; statusDenuncia: string; dataCriacao: string };

export default function Reports() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isInst = user.tipo === "instituicao";
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    api.listarDenuncias()
      .then(setDenuncias)
      .catch(() => setDenuncias([]))
      .finally(() => setLoading(false));
  }, []);

  const lista = filtro === "todos" ? denuncias : denuncias.filter((d) => d.statusDenuncia === filtro);

  return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 40px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ color: P.lime, margin: 0, fontWeight: 800, fontSize: 22 }}>
              <i className="bi bi-clipboard2-data-fill" /> Relatórios
            </h2>
            <p style={{ color: P.cream, opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
              {isInst ? "Gerencie todas as denúncias recebidas." : "Acompanhe as denúncias registradas."}
            </p>
          </div>
          <button style={newBtn} onClick={() => navigate("/report")}>
            <i className="bi bi-plus-circle-fill" /> Nova denúncia
          </button>
        </div>

        {/* Stats para instituição */}
        {isInst && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total",        value: denuncias.length,                                          icon: "bi-clipboard2-fill",       color: P.lime    },
              { label: "Alto risco",   value: denuncias.filter(d => d.nivelRisco === "high").length,     icon: "bi-exclamation-octagon-fill", color: "#dc2626" },
              { label: "Resolvidos",   value: denuncias.filter(d => d.statusDenuncia === "resolvido").length, icon: "bi-check2-circle",    color: P.green   },
            ].map((s) => (
              <div key={s.label} style={{ background: P.teal, borderRadius: 12, padding: "14px 16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                <i className={`bi ${s.icon}`} style={{ fontSize: 22, color: s.color }} />
                <div style={{ fontSize: 26, fontWeight: 800, color: P.cream, margin: "4px 0 2px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: P.cream, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtro de status */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["todos", "pendente", "em andamento", "resolvido"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12,
                background: filtro === f ? P.lime : "#2a1228", color: filtro === f ? P.dark : P.cream }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: P.cream, opacity: 0.5 }}><i className="bi bi-hourglass-split" /> Carregando...</p>}
        {!loading && lista.length === 0 && <p style={{ color: P.cream, opacity: 0.5 }}>Nenhuma denúncia encontrada.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lista.map((r) => {
            const tipo = r.tipoDenuncia || "other";
            const cor = TYPE_COLOR[tipo] || TYPE_COLOR.other;
            const status = (r.statusDenuncia || "pendente").toLowerCase();
            return (
              <div key={r.id}
                onClick={() => navigate(`/denuncia/${r.id}`)}
                style={{ background: P.cream, borderRadius: 14, padding: "16px 18px", borderLeft: `5px solid ${cor}`, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className={`bi ${TYPE_ICON[tipo] || TYPE_ICON.other}`} style={{ fontSize: 20, color: cor }} />
                    <span style={{ fontWeight: 800, fontSize: 15, color: P.dark }}>{TYPE_LABEL[tipo] || tipo}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: SEV_COLOR[r.nivelRisco] || "#64748b", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                      {SEV_LABEL[r.nivelRisco] || r.nivelRisco}
                    </span>
                    <span style={{ background: STATUS_COLOR[status] || "#64748b", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`bi ${STATUS_ICON[status] || "bi-clock"}`} /> {status}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 0 4px", color: P.teal, fontSize: 13 }}>
                  <i className="bi bi-geo-alt-fill" /> CEP: {r.cep}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{r.descricao}</p>
                <div style={{ marginTop: 8, fontSize: 11, color: P.teal, display: "flex", alignItems: "center", gap: 4 }}>
                  <i className="bi bi-calendar3" /> {r.dataCriacao ? new Date(r.dataCriacao).toLocaleDateString("pt-BR") : "—"}
                  <span style={{ marginLeft: "auto", color: P.green, fontSize: 12, fontWeight: 700 }}>Ver detalhes <i className="bi bi-arrow-right" /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const newBtn: React.CSSProperties = { background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, color: P.dark, border: "none", borderRadius: 10, padding: "10px 18px", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 };

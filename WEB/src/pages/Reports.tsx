import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const TYPE_LABEL: Record<string, string> = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade", other: "Outro" };
const TYPE_ICON:  Record<string, string> = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill", other: "bi-exclamation-triangle-fill" };
const TYPE_COLOR: Record<string, string> = { flood: "#3b82f6", landslide: "#f59e0b", storm: "#8b5cf6", other: "#64748b" };
const SEV_LABEL:  Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" };
const STATUS_COLOR: Record<string, string> = { pendente: "#d97706", "em andamento": "#3b82f6", resolvido: "#22c55e" };
const STATUS_ICON:  Record<string, string> = { pendente: "bi-clock-fill", "em andamento": "bi-arrow-repeat", resolvido: "bi-check-circle-fill" };

type Denuncia = { id: number; tipoDenuncia: string; nivelRisco: string; cep: string; descricao: string; statusDenuncia: string; dataCriacao: string };

const FILTROS = ["todos", "pendente", "em andamento", "resolvido"];

export default function Reports() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isInst = user.tipo === "instituicao";
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    api.listarDenuncias().then(setDenuncias).catch(() => setDenuncias([])).finally(() => setLoading(false));
  }, []);

  const lista = filtro === "todos" ? denuncias : denuncias.filter((d) => (d.statusDenuncia || "pendente").toLowerCase() === filtro);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="section-title"><i className="bi bi-clipboard2-data-fill" /> Relatórios</h2>
            <p className="section-sub" style={{ margin: 0 }}>
              {isInst ? "Gerencie todas as denúncias recebidas." : "Acompanhe as denúncias registradas."}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/report")}>
            <i className="bi bi-plus-circle-fill" /> Nova denúncia
          </button>
        </div>

        {/* Stats — instituição */}
        {isInst && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Total",      value: denuncias.length,                                              icon: "bi-clipboard2-fill",        color: P.lime    },
              { label: "Alto risco", value: denuncias.filter(d => d.nivelRisco === "high").length,         icon: "bi-exclamation-octagon-fill", color: "#ef4444" },
              { label: "Resolvidos", value: denuncias.filter(d => (d.statusDenuncia||"") === "resolvido").length, icon: "bi-check2-circle",   color: P.green   },
            ].map((s) => (
              <div key={s.label} className="card-teal fade-up" style={{ padding: "16px", textAlign: "center" }}>
                <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: s.color }} />
                <div style={{ fontSize: 28, fontWeight: 800, color: P.cream, margin: "6px 0 2px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: P.cream, opacity: 0.65, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={filtro === f ? "btn btn-primary btn-sm btn-pill" : "btn btn-ghost btn-sm btn-pill"}>
              {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "todos" && (
                <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "0 6px", fontSize: 11 }}>
                  {denuncias.filter(d => (d.statusDenuncia || "pendente").toLowerCase() === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && lista.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: P.cream, opacity: 0.4 }}>
            <i className="bi bi-clipboard2-x" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
            <p style={{ margin: 0, fontWeight: 700 }}>Nenhuma denúncia encontrada</p>
          </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map((r, i) => {
            const tipo = r.tipoDenuncia || "other";
            const cor = TYPE_COLOR[tipo] || TYPE_COLOR.other;
            const status = (r.statusDenuncia || "pendente").toLowerCase();
            return (
              <div key={r.id} className="card fade-up"
                style={{ borderLeft: `5px solid ${cor}`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/denuncia/${r.id}`)}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
              >
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`bi ${TYPE_ICON[tipo] || TYPE_ICON.other}`} style={{ fontSize: 18, color: cor }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: P.dark }}>{TYPE_LABEL[tipo] || tipo}</div>
                        <div style={{ fontSize: 11, color: P.teal, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="bi bi-geo-alt-fill" /> CEP {r.cep}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`badge badge-${r.nivelRisco}`}>{SEV_LABEL[r.nivelRisco] || r.nivelRisco}</span>
                      <span className="badge" style={{ background: STATUS_COLOR[status] || "#64748b", color: "#fff" }}>
                        <i className={`bi ${STATUS_ICON[status] || "bi-clock"}`} /> {status}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{r.descricao}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: P.teal, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className="bi bi-calendar3" /> {r.dataCriacao ? new Date(r.dataCriacao).toLocaleDateString("pt-BR") : "—"}
                    </span>
                    <span style={{ fontSize: 12, color: P.green, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                      Ver detalhes <i className="bi bi-arrow-right" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

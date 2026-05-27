import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const TYPE_LABEL: Record<string, string> = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade", other: "Outro" };
const TYPE_COLOR: Record<string, string> = { flood: "#3b82f6", landslide: "#f59e0b", storm: "#8b5cf6", other: "#64748b" };
const TYPE_ICON:  Record<string, string> = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill", other: "bi-exclamation-triangle-fill" };
const SEV_COLOR:  Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const SEV_LABEL:  Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" };

const STAGES = [
  { key: "pendente",     label: "Pendente",     icon: "bi-clock-fill",        color: "#d97706", desc: "Denúncia registrada, aguardando análise." },
  { key: "em andamento", label: "Em andamento", icon: "bi-arrow-repeat",      color: "#3b82f6", desc: "Equipe responsável está atuando no local."  },
  { key: "resolvido",    label: "Resolvido",    icon: "bi-check-circle-fill", color: "#22c55e", desc: "Ocorrência encerrada e situação normalizada." },
];

type Denuncia = { id: number; tipoDenuncia: string; nivelRisco: string; cep: string; descricao: string; statusDenuncia: string; dataCriacao: string };

export default function DenunciaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isInst = user.tipo === "instituicao";

  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.buscarDenuncia(Number(id)).then(setDenuncia).catch(() => setErro("Denúncia não encontrada.")).finally(() => setLoading(false));
  }, [id]);

  const mudarStatus = async (novoStatus: string) => {
    if (!denuncia) return;
    setUpdating(true);
    try { setDenuncia(await api.atualizarStatus(denuncia.id, novoStatus)); }
    catch (err: unknown) { setErro(err instanceof Error ? err.message : "Erro ao atualizar."); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="page"><Navbar />
      <div className="page-content-sm">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 14 }} />)}
      </div>
    </div>
  );

  if (!denuncia) return (
    <div className="page"><Navbar />
      <div className="page-content-sm" style={{ textAlign: "center", paddingTop: 60 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 48, color: "#ef4444", display: "block", marginBottom: 12 }} />
        <p style={{ color: P.cream }}>{erro || "Não encontrado."}</p>
        <button className="btn btn-secondary" onClick={() => navigate("/reports")}>Voltar</button>
      </div>
    </div>
  );

  const tipo = denuncia.tipoDenuncia || "other";
  const cor = TYPE_COLOR[tipo] || TYPE_COLOR.other;
  const statusAtual = (denuncia.statusDenuncia || "pendente").toLowerCase();
  const stageIdx = STAGES.findIndex(s => s.key === statusAtual);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content-sm">
        <button className="back-btn" onClick={() => navigate("/reports")}>
          <i className="bi bi-arrow-left" /> Voltar aos relatórios
        </button>

        {/* Header */}
        <div className="card fade-up" style={{ borderTop: `5px solid ${cor}`, marginBottom: 14 }}>
          <div style={{ padding: "22px 22px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${cor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`bi ${TYPE_ICON[tipo]}`} style={{ fontSize: 24, color: cor }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{TYPE_LABEL[tipo]}</div>
                <h2 style={{ margin: 0, color: P.dark, fontWeight: 800, fontSize: 19 }}>Denúncia #{denuncia.id}</h2>
              </div>
              <span className={`badge badge-${denuncia.nivelRisco}`} style={{ fontSize: 12, padding: "5px 12px" }}>
                {SEV_LABEL[denuncia.nivelRisco] || denuncia.nivelRisco}
              </span>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: P.teal, display: "flex", alignItems: "center", gap: 5 }}>
                <i className="bi bi-geo-alt-fill" style={{ color: P.green }} /> CEP: <strong>{denuncia.cep}</strong>
              </span>
              <span style={{ fontSize: 13, color: P.teal, display: "flex", alignItems: "center", gap: 5 }}>
                <i className="bi bi-calendar3" style={{ color: P.green }} />
                {denuncia.dataCriacao ? new Date(denuncia.dataCriacao).toLocaleString("pt-BR") : "—"}
              </span>
            </div>

            <div style={{ background: "#f8f8f0", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${cor}` }}>
              <p style={{ margin: 0, fontSize: 14, color: P.dark, lineHeight: 1.7 }}>{denuncia.descricao}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: "22px" }}>
            <h3 style={{ margin: "0 0 22px", color: P.dark, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="bi bi-diagram-3-fill" style={{ color: P.green }} /> Progresso
            </h3>
            {STAGES.map((stage, idx) => {
              const done = idx <= stageIdx;
              const current = idx === stageIdx;
              return (
                <div key={stage.key} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? stage.color : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: current ? `0 0 0 5px ${stage.color}30` : "none", transition: "all 0.3s" }}>
                      <i className={`bi ${stage.icon}`} style={{ color: done ? "#fff" : "#9ca3af", fontSize: 15 }} />
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 28, background: idx < stageIdx ? stage.color : "#e5e7eb", margin: "4px 0", transition: "background 0.3s" }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: idx < STAGES.length - 1 ? 22 : 0, paddingTop: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: done ? P.dark : "#9ca3af" }}>{stage.label}</div>
                    <div style={{ fontSize: 12, color: done ? P.teal : "#d1d5db", marginTop: 2 }}>{stage.desc}</div>
                    {current && (
                      <span className="badge" style={{ background: stage.color, color: "#fff", marginTop: 6 }}>
                        <i className={`bi ${stage.icon}`} /> Status atual
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controle — instituição */}
        {isInst && (
          <div className="card fade-up">
            <div style={{ padding: "22px" }}>
              <h3 style={{ margin: "0 0 16px", color: P.dark, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bi bi-pencil-square" style={{ color: P.green }} /> Atualizar Status
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STAGES.map((stage) => {
                  const active = statusAtual === stage.key;
                  return (
                    <button key={stage.key} disabled={updating || active}
                      onClick={() => mudarStatus(stage.key)}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: `2px solid ${stage.color}`, borderRadius: 10, background: active ? stage.color : "transparent", color: active ? "#fff" : stage.color, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: active ? "default" : "pointer", opacity: updating ? 0.6 : 1, transition: "all 0.2s" }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${stage.color}18`; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <i className={`bi ${stage.icon}`} /> {stage.label}
                    </button>
                  );
                })}
              </div>
              {erro && <div className="alert alert-error" style={{ marginTop: 12 }}><i className="bi bi-exclamation-triangle-fill" /> {erro}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

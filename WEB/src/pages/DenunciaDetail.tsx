import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const TYPE_LABEL: Record<string, string> = { flood: "Enchente", landslide: "Desabamento", storm: "Tempestade", other: "Outro" };
const TYPE_COLOR: Record<string, string> = { flood: "#2563eb", landslide: "#b45309", storm: "#7c3aed", other: "#64748b" };
const TYPE_ICON:  Record<string, string> = { flood: "bi-water", landslide: "bi-triangle-fill", storm: "bi-cloud-lightning-rain-fill", other: "bi-exclamation-triangle-fill" };
const SEV_COLOR:  Record<string, string> = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };
const SEV_LABEL:  Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" };

const STAGES = [
  { key: "pendente",      label: "Pendente",      icon: "bi-clock-fill",       color: "#d97706", desc: "Denúncia registrada, aguardando análise." },
  { key: "em andamento",  label: "Em andamento",  icon: "bi-arrow-repeat",     color: "#2563eb", desc: "Equipe responsável está atuando no local." },
  { key: "resolvido",     label: "Resolvido",     icon: "bi-check-circle-fill", color: "#16a34a", desc: "Ocorrência encerrada e situação normalizada." },
];

type Denuncia = { id: number; tipoDenuncia: string; nivelRisco: string; cep: string; descricao: string; statusDenuncia: string; dataCriacao: string; usuarioId?: number };

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
    api.buscarDenuncia(Number(id))
      .then(setDenuncia)
      .catch(() => setErro("Denúncia não encontrada."))
      .finally(() => setLoading(false));
  }, [id]);

  const mudarStatus = async (novoStatus: string) => {
    if (!denuncia) return;
    setUpdating(true);
    try {
      const atualizada = await api.atualizarStatus(denuncia.id, novoStatus);
      setDenuncia(atualizada);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <p style={{ color: P.cream, opacity: 0.5 }}><i className="bi bi-hourglass-split" /> Carregando...</p>
      </div>
    </div>
  );

  if (!denuncia || erro) return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <p style={{ color: "#f87171" }}><i className="bi bi-exclamation-triangle-fill" /> {erro || "Não encontrado."}</p>
      </div>
    </div>
  );

  const tipo = denuncia.tipoDenuncia || "other";
  const cor = TYPE_COLOR[tipo] || TYPE_COLOR.other;
  const statusAtual = (denuncia.statusDenuncia || "pendente").toLowerCase();
  const stageIdx = STAGES.findIndex(s => s.key === statusAtual);

  return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 40px" }}>

        <button style={backBtn} onClick={() => navigate("/reports")}>
          <i className="bi bi-arrow-left" /> Voltar aos relatórios
        </button>

        {/* Header card */}
        <div style={{ background: P.cream, borderRadius: 16, padding: "24px", borderTop: `5px solid ${cor}`, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <i className={`bi ${TYPE_ICON[tipo] || TYPE_ICON.other}`} style={{ fontSize: 28, color: cor }} />
            <div>
              <span style={{ fontSize: 12, color: cor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{TYPE_LABEL[tipo] || tipo}</span>
              <h2 style={{ margin: 0, color: P.dark, fontWeight: 800, fontSize: 20 }}>Denúncia #{denuncia.id}</h2>
            </div>
            <span style={{ marginLeft: "auto", background: SEV_COLOR[denuncia.nivelRisco] || "#64748b", color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>
              {SEV_LABEL[denuncia.nivelRisco] || denuncia.nivelRisco}
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: P.teal, display: "flex", alignItems: "center", gap: 5 }}>
              <i className="bi bi-geo-alt-fill" /> CEP: <strong>{denuncia.cep}</strong>
            </span>
            <span style={{ fontSize: 13, color: P.teal, display: "flex", alignItems: "center", gap: 5 }}>
              <i className="bi bi-calendar3" /> {denuncia.dataCriacao ? new Date(denuncia.dataCriacao).toLocaleString("pt-BR") : "—"}
            </span>
          </div>

          <div style={{ background: "#f8f8f0", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${cor}` }}>
            <p style={{ margin: 0, fontSize: 14, color: P.dark, lineHeight: 1.6 }}>{denuncia.descricao}</p>
          </div>
        </div>

        {/* Timeline de status */}
        <div style={{ background: P.cream, borderRadius: 16, padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 20px", color: P.dark, fontWeight: 800, fontSize: 16 }}>
            <i className="bi bi-diagram-3-fill" style={{ color: P.green }} /> Progresso da Denúncia
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STAGES.map((stage, idx) => {
              const done = idx <= stageIdx;
              const current = idx === stageIdx;
              return (
                <div key={stage.key} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* linha vertical */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? stage.color : "#ddd", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: current ? `0 0 0 4px ${stage.color}44` : "none", transition: "all 0.3s" }}>
                      <i className={`bi ${stage.icon}`} style={{ color: done ? "#fff" : "#aaa", fontSize: 14 }} />
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 24, background: idx < stageIdx ? stage.color : "#ddd", margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: idx < STAGES.length - 1 ? 20 : 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: done ? P.dark : "#aaa" }}>{stage.label}</div>
                    <div style={{ fontSize: 12, color: done ? P.teal : "#bbb", marginTop: 2 }}>{stage.desc}</div>
                    {current && <span style={{ display: "inline-block", marginTop: 4, background: stage.color, color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>Status atual</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controle de status — só para instituições */}
        {isInst && (
          <div style={{ background: P.cream, borderRadius: 16, padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 14px", color: P.dark, fontWeight: 800, fontSize: 16 }}>
              <i className="bi bi-pencil-square" style={{ color: P.green }} /> Atualizar Status
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {STAGES.map((stage) => (
                <button key={stage.key} disabled={updating || statusAtual === stage.key}
                  onClick={() => mudarStatus(stage.key)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: `2px solid ${stage.color}`, borderRadius: 10, background: statusAtual === stage.key ? stage.color : "transparent", color: statusAtual === stage.key ? "#fff" : stage.color, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: statusAtual === stage.key ? "default" : "pointer", opacity: updating ? 0.6 : 1, transition: "all 0.2s" }}>
                  <i className={`bi ${stage.icon}`} /> {stage.label}
                </button>
              ))}
            </div>
            {erro && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 10 }}><i className="bi bi-exclamation-triangle-fill" /> {erro}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = { background: "none", border: "none", color: P.lime, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif" };

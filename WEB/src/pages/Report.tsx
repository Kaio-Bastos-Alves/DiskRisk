import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

type FormData = { tipoDenuncia: string; cep: string; descricao: string; nivelRisco: string };
const INITIAL: FormData = { tipoDenuncia: "", cep: "", descricao: "", nivelRisco: "" };

const TIPOS = [
  { value: "flood",     label: "Enchente",                icon: "bi-water",                       color: "#3b82f6" },
  { value: "landslide", label: "Desabamento/Deslizamento", icon: "bi-triangle-fill",               color: "#f59e0b" },
  { value: "storm",     label: "Chuva forte/Tempestade",  icon: "bi-cloud-lightning-rain-fill",    color: "#8b5cf6" },
  { value: "other",     label: "Outro",                   icon: "bi-exclamation-triangle-fill",    color: "#64748b" },
];

const NIVEIS = [
  { value: "high",   label: "Alto — Perigo imediato",        color: "#ef4444", icon: "bi-exclamation-octagon-fill" },
  { value: "medium", label: "Médio — Situação preocupante",  color: "#f59e0b", icon: "bi-exclamation-triangle-fill" },
  { value: "low",    label: "Baixo — Monitoramento",         color: "#22c55e", icon: "bi-info-circle-fill" },
];

// Mapas para enviar valores compatíveis com o backend (português)
const TIPO_MAP: Record<string, string> = {
  flood: "Enchente",
  landslide: "Desabamento/Deslizamento",
  storm: "Chuva forte/Tempestade",
  other: "Outro",
};
const NIVEIS_MAP: Record<string, string> = {
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

export default function Report() {
  const navigate = useNavigate();
  // Retorna null quando não há user salvo, evita objeto vazio sem id
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipoDenuncia || !form.cep || !form.descricao || !form.nivelRisco) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    const cepDigits = form.cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      setError("CEP deve ter 8 dígitos.");
      return;
    }

    // UsuarioId é obrigatório conforme schema do banco (NOT NULL)
    if (!user || typeof user.id !== "number") {
      setError("É necessário fazer login para enviar uma denúncia.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = {
        // names must match entity properties: tipoDenuncia, cep, descricao, nivelRisco, statusDenuncia, usuarioId
        tipoDenuncia: TIPO_MAP[form.tipoDenuncia] || form.tipoDenuncia,
        cep: cepDigits,
        descricao: form.descricao,
        nivelRisco: NIVEIS_MAP[form.nivelRisco] || form.nivelRisco,
        statusDenuncia: "pendente",
        // foto é opcional no banco — enviar explicitamente null para deixar claro
        fotoDenuncia: null,
        usuarioId: user.id
      };

      // ajuda a confirmar exatamente o que será enviado ao backend
      console.log("Payload criarDenuncia:", payload);

      await api.criarDenuncia(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      // tenta extrair mensagem do corpo da resposta (axios/fetch compatível)
      const msg = (err as any)?.response?.data || (err as any)?.message || "Erro ao enviar.";
      console.error("Erro criarDenuncia:", err);
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="page"><Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
        <div className="card fade-up" style={{ padding: "48px 36px", textAlign: "center", maxWidth: 400, width: "100%" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <i className="bi bi-check-lg" style={{ fontSize: 36, color: P.dark }} />
          </div>
          <h2 style={{ color: P.dark, margin: "0 0 8px", fontWeight: 800 }}>Denúncia enviada!</h2>
          <p style={{ color: P.teal, marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>Obrigado por ajudar a comunidade. Sua denúncia foi registrada e será analisada em breve.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/reports")}><i className="bi bi-clipboard2-data-fill" /> Ver relatórios</button>
            <button className="btn btn-secondary" onClick={() => navigate("/home")}><i className="bi bi-map-fill" /> Voltar ao mapa</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page"><Navbar />
      <div className="page-content-sm">
        <button className="back-btn" onClick={() => navigate("/home")}><i className="bi bi-arrow-left" /> Voltar</button>
        <h2 className="section-title"><i className="bi bi-megaphone-fill" /> Denunciar Desastre</h2>
        <p className="section-sub">Relate um risco ou desastre na sua região.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tipo */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: P.cream, display: "block", marginBottom: 10 }}>
              Tipo de desastre *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TIPOS.map((t) => (
                <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, tipoDenuncia: t.value }))}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: `2px solid ${form.tipoDenuncia === t.value ? t.color : "rgba(255,255,255,0.1)"}`, borderRadius: 12, background: form.tipoDenuncia === t.value ? `${t.color}18` : "rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.2s", color: form.tipoDenuncia === t.value ? t.color : "rgba(229,234,212,0.6)", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13 }}>
                  <i className={`bi ${t.icon}`} style={{ fontSize: 18 }} />
                  <span style={{ textAlign: "left", lineHeight: 1.3 }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: P.cream, display: "block", marginBottom: 10 }}>
              Nível de risco *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NIVEIS.map((n) => (
                <button key={n.value} type="button" onClick={() => setForm(f => ({ ...f, nivelRisco: n.value }))}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: `2px solid ${form.nivelRisco === n.value ? n.color : "rgba(255,255,255,0.1)"}`, borderRadius: 12, background: form.nivelRisco === n.value ? `${n.color}18` : "rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.2s", color: form.nivelRisco === n.value ? n.color : "rgba(229,234,212,0.6)", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, textAlign: "left" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: form.nivelRisco === n.value ? n.color : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    <i className={`bi ${n.icon}`} style={{ color: form.nivelRisco === n.value ? "#fff" : "rgba(229,234,212,0.4)", fontSize: 15 }} />
                  </div>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* CEP */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: P.cream, display: "block", marginBottom: 8 }}>CEP da ocorrência *</label>
            <div className="field">
              <i className="bi bi-geo-alt-fill" />
              <input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" inputMode="numeric" maxLength={9} required />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: P.cream, display: "block", marginBottom: 8 }}>Descrição do ocorrido *</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange} required
              style={{ width: "100%", minHeight: 100, resize: "vertical", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", outline: "none", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: P.cream, lineHeight: 1.6, transition: "border-color 0.2s" }}
              placeholder="Descreva o que está acontecendo com o máximo de detalhes..."
              onFocus={e => (e.target.style.borderColor = P.green)}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle-fill" /> {error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ borderRadius: 14 }}>
            {loading ? <><i className="bi bi-hourglass-split spin" /> Enviando...</> : <><i className="bi bi-send-fill" /> Enviar denúncia</>}
          </button>
        </form>
      </div>
    </div>
  );
}

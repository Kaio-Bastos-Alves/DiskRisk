import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

type FormData = { tipoDenuncia: string; cep: string; descricao: string; nivelRisco: string };
const INITIAL: FormData = { tipoDenuncia: "", cep: "", descricao: "", nivelRisco: "" };

export default function Report() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipoDenuncia || !form.cep || !form.descricao || !form.nivelRisco) {
      setError("Preencha todos os campos obrigatórios."); return;
    }
    if (form.cep.replace(/\D/g, "").length !== 8) {
      setError("CEP deve ter 8 dígitos."); return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.criarDenuncia({
        tipoDenuncia: form.tipoDenuncia,
        cep: form.cep.replace(/\D/g, ""),
        descricao: form.descricao,
        nivelRisco: form.nivelRisco,
        statusDenuncia: "pendente",
        usuarioId: user.tipo === "morador" ? user.id : null,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar denúncia.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
        <div style={{ background: P.cream, borderRadius: 20, padding: "48px 36px", textAlign: "center", maxWidth: 400, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
          <i className="bi bi-check-circle-fill" style={{ fontSize: 56, color: P.green }} />
          <h2 style={{ color: P.dark, margin: "16px 0 8px", fontWeight: 800 }}>Denúncia enviada!</h2>
          <p style={{ color: P.teal, marginBottom: 24, fontSize: 14 }}>Obrigado por ajudar a comunidade. Sua denúncia foi registrada.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={submitBtn} onClick={() => navigate("/reports")}>
              <i className="bi bi-clipboard2-data-fill" /> Ver relatórios
            </button>
            <button style={{ ...submitBtn, background: P.teal, color: P.cream }} onClick={() => navigate("/home")}>
              <i className="bi bi-map-fill" /> Voltar ao mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px 40px" }}>
        <div style={{ background: P.cream, borderRadius: 20, padding: "28px", width: "100%", maxWidth: 520, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
          <button style={backBtn} onClick={() => navigate("/home")}>
            <i className="bi bi-arrow-left" /> Voltar
          </button>
          <h2 style={{ color: P.dark, margin: "0 0 4px", fontWeight: 800, fontSize: 22 }}>
            <i className="bi bi-megaphone-fill" style={{ color: P.green }} /> Denunciar Desastre
          </h2>
          <p style={{ color: P.teal, margin: "0 0 24px", fontSize: 14 }}>
            Relate um risco ou desastre na sua região.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Tipo de desastre *</label>
              <div style={selectWrap}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: P.green }} />
                <select name="tipoDenuncia" value={form.tipoDenuncia} onChange={handleChange} style={selectStyle}>
                  <option value="">Selecione...</option>
                  <option value="flood">🌊 Enchente</option>
                  <option value="landslide">⛰️ Desabamento / Deslizamento</option>
                  <option value="storm">⛈️ Chuva forte / Tempestade</option>
                  <option value="other">⚠️ Outro</option>
                </select>
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Nível de risco *</label>
              <div style={selectWrap}>
                <i className="bi bi-bar-chart-fill" style={{ color: P.green }} />
                <select name="nivelRisco" value={form.nivelRisco} onChange={handleChange} style={selectStyle}>
                  <option value="">Selecione...</option>
                  <option value="high">🔴 Alto — Perigo imediato</option>
                  <option value="medium">🟡 Médio — Situação preocupante</option>
                  <option value="low">🟢 Baixo — Monitoramento necessário</option>
                </select>
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>CEP da ocorrência *</label>
              <div style={inputWrap}>
                <i className="bi bi-geo-alt-fill" style={{ color: P.green }} />
                <input name="cep" value={form.cep} onChange={handleChange} style={inputStyle} placeholder="00000-000" inputMode="numeric" maxLength={9} />
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Descrição do ocorrido *</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange}
                style={{ ...inputStyle, minHeight: 90, resize: "vertical", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #ccc", outline: "none", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: P.dark }}
                placeholder="Descreva o que está acontecendo..." />
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                <i className="bi bi-exclamation-triangle-fill" /> {error}
              </div>
            )}

            <button type="submit" style={submitBtn} disabled={loading}>
              {loading ? <><i className="bi bi-hourglass-split" /> Enviando...</> : <><i className="bi bi-send-fill" /> Enviar denúncia</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = { background: "none", border: "none", color: P.teal, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif" };
const fieldGroup: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: P.teal };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, background: "white", border: "1.5px solid #ccc", borderRadius: 10, padding: "0 14px" };
const selectWrap: React.CSSProperties = { ...inputWrap };
const inputStyle: React.CSSProperties = { flex: 1, border: "none", outline: "none", padding: "11px 0", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: P.dark, background: "transparent" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" as const };
const submitBtn: React.CSSProperties = { background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, color: P.dark, border: "none", borderRadius: 10, padding: "13px", fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };

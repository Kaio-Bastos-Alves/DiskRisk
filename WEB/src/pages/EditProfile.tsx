import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [form, setForm] = useState({ nome: user.nome || "", email: user.email || "", senha: "", cep: user.cep || "", cpf: user.cpf || "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!form.email.trim()) { setErro("E-mail é obrigatório."); return; }
    if (form.cep && form.cep.replace(/\D/g, "").length !== 8) { setErro("CEP deve ter 8 dígitos."); return; }
    if (form.cpf && form.cpf.replace(/\D/g, "").length !== 11) { setErro("CPF deve ter 11 dígitos."); return; }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        nome: form.nome, email: form.email,
        cep: form.cep.replace(/\D/g, ""),
        senha: form.senha || user.senha || "",
      };
      if (form.cpf) payload.cpf = form.cpf.replace(/\D/g, "");

      const updated = user.tipo === "morador"
        ? await api.atualizarMorador(user.id, payload)
        : await api.atualizarInstituicao(user.id, payload);

      const newUser = { ...user, nome: updated.nome || form.nome, email: updated.email || form.email };
      sessionStorage.setItem("user", JSON.stringify(newUser));
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px 40px" }}>
        <div style={{ background: P.cream, borderRadius: 20, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>

          <button style={backBtn} onClick={() => navigate("/home")}>
            <i className="bi bi-arrow-left" /> Voltar
          </button>

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: P.green, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: `0 0 0 4px ${P.lime}44` }}>
              <i className={`bi ${user.tipo === "instituicao" ? "bi-building-fill" : "bi-person-fill"}`} style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: P.dark }}>{user.nome}</span>
            <span style={{ fontSize: 12, color: P.teal, background: P.green + "22", borderRadius: 20, padding: "2px 12px", marginTop: 4, fontWeight: 700 }}>
              {user.tipo === "instituicao" ? "Instituição" : "Morador"}
            </span>
          </div>

          <h3 style={{ color: P.dark, margin: "0 0 20px", fontWeight: 800, fontSize: 16 }}>
            <i className="bi bi-pencil-square" style={{ color: P.green }} /> Editar Perfil
          </h3>

          {sucesso && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="bi bi-check-circle-fill" /> Perfil atualizado com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={fieldWrap}>
              <i className="bi bi-person-fill" style={{ color: P.green }} />
              <input placeholder="Nome completo" value={form.nome} onChange={set("nome")} style={inputStyle} required />
            </div>
            <div style={fieldWrap}>
              <i className="bi bi-envelope-fill" style={{ color: P.green }} />
              <input type="email" placeholder="E-mail" value={form.email} onChange={set("email")} style={inputStyle} required />
            </div>
            <div style={fieldWrap}>
              <i className="bi bi-lock-fill" style={{ color: P.green }} />
              <input type="password" placeholder="Nova senha (deixe em branco para manter)" value={form.senha} onChange={set("senha")} style={inputStyle} minLength={6} />
            </div>
            <div style={fieldWrap}>
              <i className="bi bi-geo-alt-fill" style={{ color: P.green }} />
              <input placeholder="CEP (8 dígitos)" value={form.cep} onChange={set("cep")} style={inputStyle} maxLength={9} inputMode="numeric" />
            </div>
            <div style={fieldWrap}>
              <i className="bi bi-card-text" style={{ color: P.green }} />
              <input placeholder="CPF (11 dígitos, opcional)" value={form.cpf} onChange={set("cpf")} style={inputStyle} maxLength={11} inputMode="numeric" />
            </div>

            {erro && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                <i className="bi bi-exclamation-triangle-fill" /> {erro}
              </div>
            )}

            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><i className="bi bi-hourglass-split" /> Salvando...</> : <><i className="bi bi-check2-circle" /> Salvar alterações</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = { background: "none", border: "none", color: P.teal, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif" };
const fieldWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, background: "white", border: "1.5px solid #ccc", borderRadius: 10, padding: "0 14px" };
const inputStyle: React.CSSProperties = { flex: 1, border: "none", outline: "none", padding: "11px 0", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: P.dark, background: "transparent" };
const submitBtn: React.CSSProperties = { background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, color: P.dark, border: "none", borderRadius: 10, padding: "13px", fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 };

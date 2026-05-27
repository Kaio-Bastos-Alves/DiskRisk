import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { api } from "../api";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isInst = user.tipo === "instituicao";
  const [form, setForm] = useState({ nome: user.nome || "", email: user.email || "", senha: "", cep: user.cep || "", cpf: user.cpf || "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null); setSucesso(false);
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!form.email.trim()) { setErro("E-mail é obrigatório."); return; }
    if (form.cep && form.cep.replace(/\D/g, "").length !== 8) { setErro("CEP deve ter 8 dígitos."); return; }
    if (form.cpf && form.cpf.replace(/\D/g, "").length !== 11) { setErro("CPF deve ter 11 dígitos."); return; }
    setLoading(true);
    try {
      const payload: Record<string, string> = { nome: form.nome, email: form.email, cep: form.cep.replace(/\D/g, ""), senha: form.senha || user.senha || "" };
      if (form.cpf) payload.cpf = form.cpf.replace(/\D/g, "");
      const updated = isInst ? await api.atualizarInstituicao(user.id, payload) : await api.atualizarMorador(user.id, payload);
      sessionStorage.setItem("user", JSON.stringify({ ...user, nome: updated.nome || form.nome, email: updated.email || form.email }));
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally { setLoading(false); }
  };

  const FIELDS = [
    { key: "nome",  icon: "bi-person-fill",   type: "text",     placeholder: "Nome completo",                    required: true  },
    { key: "email", icon: "bi-envelope-fill",  type: "email",    placeholder: "E-mail",                           required: true  },
    { key: "senha", icon: "bi-lock-fill",      type: "password", placeholder: "Nova senha (deixe em branco)",     required: false },
    { key: "cep",   icon: "bi-geo-alt-fill",   type: "text",     placeholder: "CEP (8 dígitos)",                  required: false },
    { key: "cpf",   icon: "bi-card-text",      type: "text",     placeholder: "CPF (11 dígitos, opcional)",       required: false },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="page-content-sm">
        <button className="back-btn" onClick={() => navigate("/home")}><i className="bi bi-arrow-left" /> Voltar</button>

        {/* Avatar header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: `0 0 0 6px rgba(154,204,119,0.15), 0 8px 24px rgba(0,0,0,0.3)` }}>
            <i className={`bi ${isInst ? "bi-building-fill" : "bi-person-fill"}`} style={{ fontSize: 36, color: P.dark }} />
          </div>
          <h2 style={{ color: P.cream, margin: "0 0 4px", fontWeight: 800, fontSize: 20 }}>{user.nome}</h2>
          <span className={`badge ${isInst ? "badge-andamento" : "badge-resolvido"}`} style={{ fontSize: 12, padding: "4px 14px" }}>
            {isInst ? "Instituição" : "Morador"}
          </span>
        </div>

        <div className="card fade-up">
          <div style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", color: P.dark, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="bi bi-pencil-square" style={{ color: P.green }} /> Editar Perfil
            </h3>

            {sucesso && <div className="alert alert-success" style={{ marginBottom: 16 }}><i className="bi bi-check-circle-fill" /> Perfil atualizado com sucesso!</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FIELDS.map((f) => (
                <div key={f.key} className="field">
                  <i className={`bi ${f.icon}`} />
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={set(f.key)}
                    required={f.required}
                    inputMode={f.key === "cep" || f.key === "cpf" ? "numeric" : undefined}
                    maxLength={f.key === "cep" ? 9 : f.key === "cpf" ? 11 : undefined}
                    minLength={f.key === "senha" && form.senha ? 6 : undefined}
                  />
                </div>
              ))}

              {erro && <div className="alert alert-error"><i className="bi bi-exclamation-triangle-fill" /> {erro}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, padding: "13px", fontSize: 15, borderRadius: 12 }}>
                {loading ? <><i className="bi bi-hourglass-split spin" /> Salvando...</> : <><i className="bi bi-check2-circle" /> Salvar alterações</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

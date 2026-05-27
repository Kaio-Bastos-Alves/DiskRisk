import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import logo from "../assets/logohakc.png";

type Perfil = "morador" | "instituicao" | null;
type CepStatus = "incompleto" | "loading" | "ok" | "erro" | null;

const P = {
  dark: "#1f0a1d",
  teal: "#334f53",
  green: "#45936c",
  lime: "#9acc77",
  cream: "#e5ead4",
};

export default function Login() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cep: "", cpf: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cepStatus, setCepStatus] = useState<CepStatus>(null);
  const [cepInfo, setCepInfo] = useState<string | null>(null);
  const cepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCep = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    setForm((f) => ({ ...f, cep: raw }));
    setCepInfo(null);
    if (cepTimer.current) clearTimeout(cepTimer.current);
    if (raw.length < 8) { setCepStatus(raw.length > 0 ? "incompleto" : null); return; }
    setCepStatus("loading");
    cepTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (data.erro) { setCepStatus("erro"); return; }
        setCepStatus("ok");
        setCepInfo(`${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}`);
      } catch { setCepStatus("erro"); }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (modo === "cadastro") {
      if (form.senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
      if (form.cep.length !== 8) { setErro("Digite um CEP com 8 dígitos."); return; }
      if (cepStatus !== "ok") { setErro("CEP inválido. Verifique e tente novamente."); return; }
      if (form.cpf && form.cpf.length !== 11) { setErro("CPF deve ter exatamente 11 dígitos."); return; }
    }
    setLoading(true);
    try {
      let user;
      if (modo === "login") {
        user = perfil === "morador"
          ? await api.loginMorador(form.email, form.senha)
          : await api.loginInstituicao(form.email, form.senha);
      } else {
        user = perfil === "morador"
          ? await api.cadastroMorador(form)
          : await api.cadastroInstituicao(form);
      }
      sessionStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const voltar = () => {
    setPerfil(null); setErro(null);
    setForm({ nome: "", email: "", senha: "", cep: "", cpf: "" });
    setCepStatus(null); setCepInfo(null);
  };

  const cepFieldClass = `dr-field${cepStatus === "erro" || cepStatus === "incompleto" ? " dr-field-err" : cepStatus === "ok" ? " dr-field-ok" : ""}`;

  return (
    <div className="dr-page">
      <div className="dr-card">
        <div className="dr-logo">
          <img src={logo} alt="DiskRisk" style={{ height: 56, objectFit: "contain" }} />
        </div>

        {!perfil ? (
          <>
            <p className="dr-subtitle">Como você quer entrar?</p>
            <div className="dr-profile-grid">
              <button className="dr-profile-btn" onClick={() => setPerfil("morador")}>
                <i className="bi bi-house-fill" />
                <span>Morador</span>
                <small>Reporte riscos na sua região</small>
              </button>
              <button className="dr-profile-btn" onClick={() => setPerfil("instituicao")}>
                <i className="bi bi-building-fill" />
                <span>Instituição</span>
                <small>Gerencie alertas e denúncias</small>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="dr-back" onClick={voltar}>
              <i className="bi bi-arrow-left" /> Voltar
            </div>

            <div className="dr-perfil-badge">
              <i className={`bi ${perfil === "morador" ? "bi-house-fill" : "bi-building-fill"}`} />
              {perfil === "morador" ? "Morador" : "Instituição"}
            </div>

            <div className="dr-tabs">
              <button className={modo === "login" ? "active" : ""} onClick={() => { setModo("login"); setErro(null); }}>
                <i className="bi bi-box-arrow-in-right" /> Entrar
              </button>
              <button className={modo === "cadastro" ? "active" : ""} onClick={() => { setModo("cadastro"); setErro(null); }}>
                <i className="bi bi-person-plus-fill" /> Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dr-form">
              {modo === "cadastro" && (
                <div className="dr-field">
                  <i className="bi bi-person-fill" />
                  <input placeholder="Nome completo" value={form.nome} onChange={set("nome")} required />
                </div>
              )}

              <div className="dr-field">
                <i className="bi bi-envelope-fill" />
                <input type="email" placeholder="E-mail" value={form.email} onChange={set("email")} required />
              </div>

              <div className="dr-field">
                <i className="bi bi-lock-fill" />
                <input type="password" placeholder="Senha (mín. 6 caracteres)" value={form.senha} onChange={set("senha")} required minLength={6} />
              </div>

              {modo === "cadastro" && (
                <>
                  <div className={cepFieldClass}>
                    <i className="bi bi-geo-alt-fill" />
                    <input placeholder="CEP (8 dígitos)" value={form.cep} onChange={handleCep} required inputMode="numeric" />
                    {cepStatus === "loading" && <i className="bi bi-hourglass-split dr-cep-icon spin" />}
                    {cepStatus === "ok" && <i className="bi bi-check-circle-fill dr-cep-icon" style={{ color: P.green }} />}
                    {(cepStatus === "erro" || cepStatus === "incompleto") && <i className="bi bi-x-circle-fill dr-cep-icon" style={{ color: "#b91c1c" }} />}
                  </div>
                  {cepStatus === "ok" && cepInfo && (
                    <div className="dr-cep-info"><i className="bi bi-map" /> {cepInfo}</div>
                  )}
                  {cepStatus === "erro" && (
                    <div className="dr-cep-hint err"><i className="bi bi-exclamation-circle" /> CEP não encontrado.</div>
                  )}
                  {cepStatus === "incompleto" && (
                    <div className="dr-cep-hint err"><i className="bi bi-exclamation-circle" /> CEP deve ter 8 dígitos.</div>
                  )}
                  <div className="dr-field">
                    <i className="bi bi-card-text" />
                    <input placeholder="CPF (11 dígitos, opcional)" value={form.cpf} onChange={set("cpf")} maxLength={11} inputMode="numeric" />
                  </div>
                </>
              )}

              {erro && (
                <div className="dr-erro">
                  <i className="bi bi-exclamation-triangle-fill" /> {erro}
                </div>
              )}

              <button type="submit" className="dr-submit" disabled={loading}>
                {loading
                  ? <><i className="bi bi-hourglass-split" /> Aguarde...</>
                  : modo === "login"
                    ? <><i className="bi bi-box-arrow-in-right" /> Entrar</>
                    : <><i className="bi bi-person-check-fill" /> Criar conta</>
                }
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        .dr-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, ${P.dark} 0%, ${P.teal} 60%, ${P.green} 100%);
          padding: 20px;
          font-family: 'Nunito', sans-serif;
        }
        .dr-card {
          background: ${P.cream};
          border-radius: 20px;
          padding: 36px 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
        }
        .dr-logo {
          display: flex; align-items: center; gap: 10px; justify-content: center;
          margin-bottom: 8px; color: ${P.dark}; font-size: 28px; font-weight: 800;
        }
        .dr-logo i { font-size: 32px; color: ${P.green}; }
        .dr-subtitle { text-align: center; color: ${P.teal}; font-size: 15px; margin: 0 0 24px; font-weight: 600; }
        .dr-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .dr-profile-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 24px 16px; border: 2px solid transparent; border-radius: 14px;
          background: white; cursor: pointer; transition: all 0.2s; color: ${P.dark};
        }
        .dr-profile-btn i { font-size: 36px; color: ${P.green}; }
        .dr-profile-btn span { font-size: 16px; font-weight: 700; }
        .dr-profile-btn small { font-size: 11px; color: ${P.teal}; text-align: center; }
        .dr-profile-btn:hover {
          border-color: ${P.green}; background: ${P.lime}22;
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(69,147,108,0.2);
        }
        .dr-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: ${P.teal}; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 12px;
        }
        .dr-back:hover { color: ${P.green}; }
        .dr-perfil-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: ${P.green}; color: white; border-radius: 20px;
          padding: 4px 14px; font-size: 13px; font-weight: 700; margin-bottom: 16px;
        }
        .dr-tabs {
          display: flex; border-radius: 10px; overflow: hidden;
          border: 2px solid ${P.green}; margin-bottom: 20px;
        }
        .dr-tabs button {
          flex: 1; padding: 10px; border: none; background: transparent;
          color: ${P.teal}; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
        }
        .dr-tabs button.active { background: ${P.green}; color: white; }
        .dr-form { display: flex; flex-direction: column; gap: 12px; }
        .dr-field {
          display: flex; align-items: center; gap: 10px; background: white;
          border: 1.5px solid #ddd; border-radius: 10px; padding: 0 14px; transition: border-color 0.2s;
        }
        .dr-field:focus-within { border-color: ${P.green}; }
        .dr-field-ok { border-color: ${P.green} !important; }
        .dr-field-err { border-color: #f87171 !important; }
        .dr-field i { color: ${P.green}; font-size: 16px; flex-shrink: 0; }
        .dr-field input {
          flex: 1; border: none; outline: none; padding: 12px 0;
          font-family: 'Nunito', sans-serif; font-size: 14px; color: ${P.dark}; background: transparent;
        }
        .dr-field input::placeholder { color: #aaa; }
        .dr-cep-icon { font-size: 16px; flex-shrink: 0; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dr-cep-info {
          font-size: 12px; color: ${P.green}; font-weight: 600;
          display: flex; align-items: center; gap: 5px; margin-top: -6px; padding: 0 4px;
        }
        .dr-cep-hint {
          font-size: 12px; display: flex; align-items: center; gap: 5px; margin-top: -6px; padding: 0 4px;
        }
        .dr-cep-hint.err { color: #b91c1c; }
        .dr-erro {
          background: #fff0f0; border: 1px solid #fca5a5; color: #b91c1c;
          border-radius: 8px; padding: 10px 14px; font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }
        .dr-submit {
          background: linear-gradient(135deg, ${P.green}, ${P.lime});
          color: ${P.dark}; border: none; border-radius: 10px; padding: 13px;
          font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: opacity 0.2s, transform 0.2s; margin-top: 4px;
        }
        .dr-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .dr-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 480px) {
          .dr-card { padding: 28px 20px; }
          .dr-profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

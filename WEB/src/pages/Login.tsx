import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import logo from "../assets/logohakc.png";

type Perfil = "morador" | "instituicao" | null;
type CepStatus = "incompleto" | "loading" | "ok" | "erro" | null;

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

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
      const user = modo === "login"
        ? perfil === "morador" ? await api.loginMorador(form.email, form.senha) : await api.loginInstituicao(form.email, form.senha)
        : perfil === "morador" ? await api.cadastroMorador(form) : await api.cadastroInstituicao(form);
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

  const cepFieldClass = `field${cepStatus === "erro" || cepStatus === "incompleto" ? " error" : cepStatus === "ok" ? " success" : ""}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 36, padding: "32px 20px", background: `linear-gradient(145deg, ${P.dark} 0%, #2d1a2b 40%, ${P.teal} 100%)`, fontFamily: "'Nunito', sans-serif" }}>
      {/* Left panel — decorativo */}
      <div className="hide-mobile" style={{ flex: "1 1 420px", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 32 }}>
        <img src={logo} alt="DiskRisk" style={{ height: 80, objectFit: "contain" }} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: P.lime, fontSize: 32, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>Proteja sua<br />comunidade</h1>
          <p style={{ color: P.cream, opacity: 0.6, fontSize: 15, lineHeight: 1.7, maxWidth: 280 }}>
            Reporte desastres, acompanhe riscos em tempo real e ajude a salvar vidas na sua região.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 280 }}>
          {[
            { icon: "bi-geo-alt-fill",        text: "Mapeamento de riscos em tempo real" },
            { icon: "bi-megaphone-fill",       text: "Denúncias diretas para autoridades"  },
            { icon: "bi-shield-check-fill",    text: "Alertas para sua região"             },
          ].map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`bi ${f.icon}`} style={{ color: P.dark, fontSize: 16 }} />
              </div>
              <span style={{ color: P.cream, fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "1 1 420px", width: "100%", maxWidth: 460 }}>
        <div style={{ background: P.cream, borderRadius: 24, padding: "36px 32px", width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}>

          {/* Logo mobile */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src={logo} alt="DiskRisk" style={{ height: 48, objectFit: "contain" }} />
          </div>

          {!perfil ? (
            <>
              <h2 style={{ textAlign: "center", color: P.dark, fontWeight: 800, fontSize: 20, margin: "0 0 6px" }}>Bem-vindo de volta</h2>
              <p style={{ textAlign: "center", color: P.teal, fontSize: 14, margin: "0 0 28px" }}>Como você quer acessar?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { key: "morador",    icon: "bi-house-fill",    title: "Morador",    sub: "Reporte riscos na sua região" },
                  { key: "instituicao", icon: "bi-building-fill", title: "Instituição", sub: "Gerencie alertas e denúncias" },
                ].map((p) => (
                  <button key={p.key} onClick={() => setPerfil(p.key as Perfil)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "22px 14px", border: `2px solid transparent`, borderRadius: 16, background: "white", cursor: "pointer", transition: "all 0.2s", color: P.dark, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = P.green; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px rgba(69,147,108,0.2)`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`bi ${p.icon}`} style={{ fontSize: 24, color: P.dark }} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: P.teal, textAlign: "center", lineHeight: 1.4 }}>{p.sub}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button className="back-btn" onClick={voltar} style={{ color: P.teal }}>
                <i className="bi bi-arrow-left" /> Voltar
              </button>

              {/* Perfil badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${P.green}, ${P.lime})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`bi ${perfil === "morador" ? "bi-house-fill" : "bi-building-fill"}`} style={{ fontSize: 18, color: P.dark }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: P.dark, fontSize: 16 }}>{perfil === "morador" ? "Morador" : "Instituição"}</div>
                  <div style={{ fontSize: 12, color: P.teal }}>Acesso {perfil === "morador" ? "pessoal" : "institucional"}</div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", background: "#f0f0e8", borderRadius: 12, padding: 4, marginBottom: 22, gap: 4 }}>
                {(["login", "cadastro"] as const).map((m) => (
                  <button key={m} onClick={() => { setModo(m); setErro(null); }}
                    style={{ flex: 1, padding: "9px", border: "none", borderRadius: 9, fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: modo === m ? "white" : "transparent",
                      color: modo === m ? P.dark : P.teal,
                      boxShadow: modo === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                    }}>
                    <i className={`bi ${m === "login" ? "bi-box-arrow-in-right" : "bi-person-plus-fill"}`} />
                    {m === "login" ? "Entrar" : "Cadastrar"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {modo === "cadastro" && (
                  <div className="field">
                    <i className="bi bi-person-fill" />
                    <input placeholder="Nome completo" value={form.nome} onChange={set("nome")} required />
                  </div>
                )}
                <div className="field">
                  <i className="bi bi-envelope-fill" />
                  <input type="email" placeholder="E-mail" value={form.email} onChange={set("email")} required />
                </div>
                <div className="field">
                  <i className="bi bi-lock-fill" />
                  <input type="password" placeholder={modo === "cadastro" ? "Senha (mín. 6 caracteres)" : "Senha"} value={form.senha} onChange={set("senha")} required minLength={6} />
                </div>

                {modo === "cadastro" && (
                  <>
                    <div className={cepFieldClass}>
                      <i className="bi bi-geo-alt-fill" />
                      <input placeholder="CEP (8 dígitos)" value={form.cep} onChange={handleCep} required inputMode="numeric" />
                      {cepStatus === "loading" && <i className="bi bi-hourglass-split spin" style={{ color: P.teal, fontSize: 15 }} />}
                      {cepStatus === "ok"      && <i className="bi bi-check-circle-fill"  style={{ color: P.green, fontSize: 15 }} />}
                      {(cepStatus === "erro" || cepStatus === "incompleto") && <i className="bi bi-x-circle-fill" style={{ color: "#ef4444", fontSize: 15 }} />}
                    </div>
                    {cepStatus === "ok" && cepInfo && (
                      <div style={{ fontSize: 12, color: P.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 4px", marginTop: -4 }}>
                        <i className="bi bi-map-fill" /> {cepInfo}
                      </div>
                    )}
                    {(cepStatus === "erro" || cepStatus === "incompleto") && (
                      <div style={{ fontSize: 12, color: "#b91c1c", display: "flex", alignItems: "center", gap: 5, padding: "0 4px", marginTop: -4 }}>
                        <i className="bi bi-exclamation-circle-fill" />
                        {cepStatus === "erro" ? "CEP não encontrado." : "CEP deve ter 8 dígitos."}
                      </div>
                    )}
                    <div className="field">
                      <i className="bi bi-card-text" />
                      <input placeholder="CPF (11 dígitos, opcional)" value={form.cpf} onChange={set("cpf")} maxLength={11} inputMode="numeric" />
                    </div>
                  </>
                )}

                {erro && <div className="alert alert-error"><i className="bi bi-exclamation-triangle-fill" /> {erro}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, padding: "13px", fontSize: 15, borderRadius: 12 }}>
                  {loading
                    ? <><i className="bi bi-hourglass-split spin" /> Aguarde...</>
                    : modo === "login"
                      ? <><i className="bi bi-box-arrow-in-right" /> Entrar</>
                      : <><i className="bi bi-person-check-fill" /> Criar conta</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

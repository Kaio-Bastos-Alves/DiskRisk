import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const LEGENDS = [
  { color: "#3b82f6", icon: "bi-water",                    type: "Enchente",
    risks: ["Afogamento e arrastamento por correnteza", "Contaminação da água potável", "Danos estruturais em edificações", "Interrupção de energia elétrica"],
    tip: "Desligue a energia elétrica, não atravesse ruas alagadas e busque locais elevados." },
  { color: "#f59e0b", icon: "bi-triangle-fill",            type: "Desabamento / Deslizamento",
    risks: ["Soterramento de pessoas e veículos", "Bloqueio de vias e rotas de fuga", "Danos a redes de gás e esgoto", "Risco de novas quedas em cadeia"],
    tip: "Afaste-se imediatamente da área. Não retorne sem autorização da Defesa Civil." },
  { color: "#8b5cf6", icon: "bi-cloud-lightning-rain-fill", type: "Chuva Forte / Tempestade",
    risks: ["Raios e descargas elétricas", "Ventos fortes com queda de árvores", "Granizo com danos a veículos", "Visibilidade reduzida no trânsito"],
    tip: "Fique em local fechado, longe de janelas. Não se abrigue sob árvores." },
];

const SEVERITY = [
  { color: "#ef4444", label: "Alto",  desc: "Perigo imediato. Evacue a área e acione emergências." },
  { color: "#f59e0b", label: "Médio", desc: "Situação preocupante. Fique em alerta e monitore."   },
  { color: "#22c55e", label: "Baixo", desc: "Risco controlado. Monitoramento preventivo."          },
];

const EMERGENCY = [
  { label: "Bombeiros",       number: "193", icon: "bi-fire"            },
  { label: "SAMU",            number: "192", icon: "bi-heart-pulse-fill" },
  { label: "Defesa Civil",    number: "199", icon: "bi-shield-fill"     },
  { label: "Polícia Militar", number: "190", icon: "bi-star-fill"       },
];

export default function Legend() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <button className="back-btn" onClick={() => navigate("/home")}><i className="bi bi-arrow-left" /> Voltar ao mapa</button>
        <h2 className="section-title"><i className="bi bi-pin-map-fill" /> Legenda dos Pins</h2>
        <p className="section-sub">Entenda cada marcador e saiba como agir em cada situação.</p>

        {LEGENDS.map((item, i) => (
          <div key={item.type} className="card fade-up" style={{ marginBottom: 14, borderTop: `4px solid ${item.color}`, animationDelay: `${i * 0.08}s` }}>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`bi ${item.icon}`} style={{ fontSize: 22, color: item.color }} />
                </div>
                <span style={{ fontSize: 17, fontWeight: 800, color: item.color }}>{item.type}</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 800, color: P.teal, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <i className="bi bi-exclamation-triangle-fill" /> Riscos
              </p>
              <ul style={{ margin: "0 0 14px", paddingLeft: 18 }}>
                {item.risks.map((r) => <li key={r} style={{ fontSize: 13, color: P.dark, marginBottom: 4, lineHeight: 1.5 }}>{r}</li>)}
              </ul>
              <div style={{ background: `${item.color}12`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: P.dark, lineHeight: 1.6, borderLeft: `3px solid ${item.color}` }}>
                <i className="bi bi-lightbulb-fill" style={{ color: item.color }} /> <strong>O que fazer:</strong> {item.tip}
              </div>
            </div>
          </div>
        ))}

        <h3 style={{ color: P.lime, fontSize: 16, margin: "28px 0 14px", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-bar-chart-fill" /> Níveis de Severidade
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {SEVERITY.map((s) => (
            <div key={s.label} className="card-dark" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: s.color }} />
              </div>
              <div>
                <strong style={{ color: s.color, fontSize: 14 }}>{s.label}</strong>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: P.cream, opacity: 0.65 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ color: P.lime, fontSize: 16, margin: "0 0 14px", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-telephone-fill" /> Números de Emergência
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {EMERGENCY.map((e) => (
            <a key={e.label} href={`tel:${e.number}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: P.teal, borderRadius: 16, padding: "20px 12px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(154,204,119,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`bi ${e.icon}`} style={{ fontSize: 20, color: P.lime }} />
              </div>
              <span style={{ fontSize: 26, fontWeight: 800, color: P.cream }}>{e.number}</span>
              <span style={{ fontSize: 12, color: P.lime, opacity: 0.8, fontWeight: 700 }}>{e.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

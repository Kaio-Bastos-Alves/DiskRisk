import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const LEGENDS = [
  {
    color: "#2563eb", icon: "bi-water", type: "Enchente",
    risks: ["Afogamento e arrastamento por correnteza", "Contaminação da água potável", "Danos estruturais em edificações", "Interrupção de energia elétrica"],
    tip: "Desligue a energia elétrica, não atravesse ruas alagadas e busque locais elevados.",
  },
  {
    color: "#b45309", icon: "bi-triangle-fill", type: "Desabamento / Deslizamento",
    risks: ["Soterramento de pessoas e veículos", "Bloqueio de vias e rotas de fuga", "Danos a redes de gás e esgoto", "Risco de novas quedas em cadeia"],
    tip: "Afaste-se imediatamente da área. Não retorne sem autorização da Defesa Civil.",
  },
  {
    color: "#7c3aed", icon: "bi-cloud-lightning-rain-fill", type: "Chuva Forte / Tempestade",
    risks: ["Raios e descargas elétricas", "Ventos fortes com queda de árvores", "Granizo com danos a veículos", "Visibilidade reduzida no trânsito"],
    tip: "Fique em local fechado, longe de janelas. Não se abrigue sob árvores.",
  },
];

const SEVERITY = [
  { color: "#dc2626", label: "Alto",  desc: "Perigo imediato. Evacue a área e acione emergências." },
  { color: "#d97706", label: "Médio", desc: "Situação preocupante. Fique em alerta e monitore." },
  { color: "#16a34a", label: "Baixo", desc: "Risco controlado. Monitoramento preventivo." },
];

const EMERGENCY = [
  { label: "Bombeiros",      number: "193", icon: "bi-fire"           },
  { label: "SAMU",           number: "192", icon: "bi-heart-pulse-fill"},
  { label: "Defesa Civil",   number: "199", icon: "bi-shield-fill"    },
  { label: "Polícia Militar",number: "190", icon: "bi-star-fill"      },
];

export default function Legend() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: P.dark, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 40px" }}>

        <button style={backBtn} onClick={() => navigate("/home")}>
          <i className="bi bi-arrow-left" /> Voltar ao mapa
        </button>

        <h2 style={{ color: P.lime, margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>
          <i className="bi bi-pin-map-fill" /> Legenda dos Pins
        </h2>
        <p style={{ color: P.cream, opacity: 0.7, margin: "0 0 24px", fontSize: 14 }}>
          Entenda cada marcador e saiba como agir em cada situação.
        </p>

        {LEGENDS.map((item) => (
          <div key={item.type} style={{ ...card, borderTop: `4px solid ${item.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <i className={`bi ${item.icon}`} style={{ fontSize: 26, color: item.color }} />
              <span style={{ fontSize: 17, fontWeight: 800, color: item.color }}>{item.type}</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: P.teal, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              <i className="bi bi-exclamation-triangle-fill" /> Riscos
            </p>
            <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
              {item.risks.map((r) => <li key={r} style={{ fontSize: 13, color: P.dark, marginBottom: 3 }}>{r}</li>)}
            </ul>
            <div style={{ background: `${item.color}18`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: P.dark, lineHeight: 1.5 }}>
              <i className="bi bi-lightbulb-fill" style={{ color: item.color }} /> <strong>O que fazer:</strong> {item.tip}
            </div>
          </div>
        ))}

        <h3 style={{ color: P.lime, fontSize: 16, margin: "28px 0 12px", fontWeight: 800 }}>
          <i className="bi bi-bar-chart-fill" /> Níveis de Severidade
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SEVERITY.map((s) => (
            <div key={s.label} style={{ ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
              <div>
                <strong style={{ color: s.color, fontSize: 14 }}>{s.label}</strong>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: P.teal }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ color: P.lime, fontSize: 16, margin: "28px 0 12px", fontWeight: 800 }}>
          <i className="bi bi-telephone-fill" /> Números de Emergência
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
          {EMERGENCY.map((e) => (
            <a key={e.label} href={`tel:${e.number}`} style={emergencyCard}>
              <i className={`bi ${e.icon}`} style={{ fontSize: 22, color: P.lime }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: P.cream }}>{e.number}</span>
              <span style={{ fontSize: 12, color: P.lime, opacity: 0.8 }}>{e.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = {
  background: "none", border: "none", color: P.lime, cursor: "pointer",
  fontSize: 14, fontWeight: 700, padding: 0, marginBottom: 20,
  display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif",
};
const card: React.CSSProperties = {
  background: P.cream, borderRadius: 12, padding: "16px 18px",
  marginBottom: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
};
const emergencyCard: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  background: P.teal, borderRadius: 12, padding: "16px 10px",
  textDecoration: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

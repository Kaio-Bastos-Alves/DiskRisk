import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logohakc.png";

const P = {
  dark: "#1f0a1d",
  teal: "#334f53",
  green: "#45936c",
  lime: "#9acc77",
  cream: "#e5ead4",
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const logout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { path: "/home",    icon: "bi-map-fill",           label: "Mapa"      },
    { path: "/report",  icon: "bi-megaphone-fill",      label: "Denunciar" },
    { path: "/legend",  icon: "bi-info-circle-fill",    label: "Legenda"   },
    { path: "/reports", icon: "bi-clipboard2-data-fill", label: "Relatórios"},
  ];

  return (
    <>
      <nav style={nav}>
        <img src={logo} alt="DiskRisk" style={logoStyle} onClick={() => navigate("/home")} />

        <div style={navLinks}>
          {navItems.map((item) => (
            <button
              key={item.path}
              style={{ ...navBtn, ...(location.pathname === item.path ? navBtnActive : {}) }}
              onClick={() => navigate(item.path)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <button style={profileBtn} onClick={() => setMenuOpen((o) => !o)}>
            <i className="bi bi-person-circle" style={{ fontSize: 22 }} />
            <span style={{ fontSize: 13, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.nome || "Perfil"}
            </span>
            <i className="bi bi-chevron-down" style={{ fontSize: 11 }} />
          </button>
          {menuOpen && (
            <div style={dropdown}>
              <div style={dropdownHeader}>
                <span style={{ fontWeight: 700, color: P.dark }}>{user.nome}</span>
                <span style={{ fontSize: 11, color: P.teal }}>{user.tipo === "instituicao" ? "Instituição" : "Morador"}</span>
              </div>
              <button style={dropdownItem} onClick={() => { setMenuOpen(false); navigate("/perfil/editar"); }}>
                <i className="bi bi-pencil-square" /> Editar perfil
              </button>
              <button style={{ ...dropdownItem, color: "#b91c1c" }} onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Sair
              </button>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @media (max-width: 600px) {
          .nav-links span { display: none; }
        }
      `}</style>
    </>
  );
}

const nav: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "10px 20px", background: P.dark, position: "sticky", top: 0, zIndex: 100,
  boxShadow: "0 2px 12px rgba(0,0,0,0.3)", gap: 12,
};
const logoStyle: React.CSSProperties = {
  height: 40, cursor: "pointer", objectFit: "contain", flexShrink: 0,
};
const navLinks: React.CSSProperties = {
  display: "flex", gap: 4, flex: 1, justifyContent: "center", flexWrap: "wrap",
};
const navBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
  background: "transparent", border: "none", color: "#9ca3af",
  borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif",
  fontWeight: 600, transition: "all 0.2s",
};
const navBtnActive: React.CSSProperties = {
  background: "#334f5366", color: "#9acc77",
};
const profileBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
  background: "#334f53", border: "none", borderRadius: 8, color: P.cream,
  cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 13,
};
const dropdown: React.CSSProperties = {
  position: "absolute", right: 0, top: 46, background: P.cream,
  borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", minWidth: 160, overflow: "hidden", zIndex: 200,
};
const dropdownHeader: React.CSSProperties = {
  padding: "12px 14px 8px", display: "flex", flexDirection: "column", gap: 2,
  borderBottom: `1px solid #ddd`,
};
const dropdownItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, width: "100%",
  padding: "10px 14px", background: "none", border: "none",
  textAlign: "left", cursor: "pointer", fontSize: 14,
  color: P.teal, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
};

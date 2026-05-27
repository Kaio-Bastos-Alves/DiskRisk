import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logohakc.png";

const P = { dark: "#1f0a1d", teal: "#334f53", green: "#45936c", lime: "#9acc77", cream: "#e5ead4" };

const NAV_ITEMS = [
  { path: "/home",    icon: "bi-map-fill",            label: "Mapa"       },
  { path: "/report",  icon: "bi-megaphone-fill",       label: "Denunciar"  },
  { path: "/legend",  icon: "bi-info-circle-fill",     label: "Legenda"    },
  { path: "/reports", icon: "bi-clipboard2-data-fill", label: "Relatórios" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isInst = user.tipo === "instituicao";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => { sessionStorage.removeItem("user"); navigate("/"); };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <img src={logo} alt="DiskRisk" style={logoStyle} onClick={() => navigate("/home")} />

        {/* Nav links */}
        <div style={linksWrap}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} className={`nav-item${active ? " nav-item-active" : ""}`} onClick={() => navigate(item.path)}>
                <i className={`bi ${item.icon}`} />
                <span className="hide-mobile">{item.label}</span>
                {active && <span className="nav-dot" />}
              </button>
            );
          })}
        </div>

        {/* Profile */}
        <div ref={dropRef} style={{ position: "relative", flexShrink: 0 }}>
          <button className="profile-trigger" onClick={() => setMenuOpen((o) => !o)}>
            <div className="avatar">
              <i className={`bi ${isInst ? "bi-building-fill" : "bi-person-fill"}`} />
            </div>
            <div className="profile-info hide-mobile">
              <span className="profile-name">{user.nome || "Perfil"}</span>
              <span className="profile-role">{isInst ? "Instituição" : "Morador"}</span>
            </div>
            <i className={`bi bi-chevron-down chevron${menuOpen ? " open" : ""}`} />
          </button>

          {menuOpen && (
            <div className="dropdown fade-up">
              <div className="dropdown-header">
                <div className="avatar avatar-lg">
                  <i className={`bi ${isInst ? "bi-building-fill" : "bi-person-fill"}`} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: P.dark, fontSize: 14 }}>{user.nome}</div>
                  <div style={{ fontSize: 11, color: P.teal }}>{user.email}</div>
                  <span className={`badge ${isInst ? "badge-andamento" : "badge-resolvido"}`} style={{ marginTop: 4 }}>
                    {isInst ? "Instituição" : "Morador"}
                  </span>
                </div>
              </div>
              <div className="divider" style={{ margin: "0" }} />
              <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate("/perfil/editar"); }}>
                <i className="bi bi-pencil-square" /> Editar perfil
              </button>
              <button className="dropdown-item danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Sair
              </button>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        .nav-item {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; background: transparent; border: none;
          color: rgba(229,234,212,0.45); border-radius: 10px;
          cursor: pointer; font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700; transition: all 0.2s;
          position: relative;
        }
        .nav-item:hover { color: ${P.cream}; background: rgba(255,255,255,0.06); }
        .nav-item-active { color: ${P.lime} !important; background: rgba(154,204,119,0.12) !important; }
        .nav-dot {
          position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%; background: ${P.lime};
        }
        .profile-trigger {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 6px 12px 6px 6px;
          cursor: pointer; transition: all 0.2s; color: ${P.cream};
        }
        .profile-trigger:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .avatar {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, ${P.green}, ${P.lime});
          display: flex; align-items: center; justify-content: center;
          color: ${P.dark}; font-size: 15px; flex-shrink: 0;
        }
        .avatar-lg { width: 44px; height: 44px; border-radius: 14px; font-size: 20px; }
        .profile-info { display: flex; flex-direction: column; align-items: flex-start; }
        .profile-name { font-size: 13px; font-weight: 800; color: ${P.cream}; line-height: 1.2; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .profile-role { font-size: 10px; color: ${P.lime}; font-weight: 700; }
        .chevron { font-size: 11px; color: rgba(229,234,212,0.5); transition: transform 0.2s; }
        .chevron.open { transform: rotate(180deg); }
        .dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: ${P.cream}; border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08);
          min-width: 220px; overflow: hidden; z-index: 300;
        }
        .dropdown-header {
          display: flex; align-items: center; gap: 12px;
          padding: 16px; background: linear-gradient(135deg, ${P.teal}22, ${P.green}11);
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 12px 16px; background: none; border: none;
          font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700;
          color: ${P.teal}; cursor: pointer; transition: background 0.15s; text-align: left;
        }
        .dropdown-item:hover { background: rgba(51,79,83,0.08); }
        .dropdown-item.danger { color: #b91c1c; }
        .dropdown-item.danger:hover { background: rgba(185,28,28,0.06); }
        @media (max-width: 600px) {
          .nav-item span { display: none; }
          .nav-dot { display: none; }
        }
      `}</style>
    </>
  );
}

const navStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "10px 20px", background: "rgba(31,10,29,0.95)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  position: "sticky", top: 0, zIndex: 200,
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)", gap: 12,
};
const logoStyle: React.CSSProperties = {
  height: 38, cursor: "pointer", objectFit: "contain", flexShrink: 0,
  transition: "opacity 0.2s",
};
const linksWrap: React.CSSProperties = {
  display: "flex", gap: 2, flex: 1, justifyContent: "center",
};

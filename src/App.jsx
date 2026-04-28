import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

const theme = { bg: "#000000", card: "#121212", gold: "#D4AF37", text: "#FFFFFF", border: "#1F1F1F", muted: "#8E8E93" };

const Icons = {
  Config: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Cash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
};

/* ================= LÓGICA DE DATOS ================= */
const getMyBarbershop = async (user) => {
  const { data } = await supabase.from("profiles").select("barbershop_id").eq("id", user.id).maybeSingle();
  return data?.barbershop_id || null;
}

const createBarbershopForUser = async (user) => {
  const { data: shop } = await supabase.from("barbershops").insert([{ name: "Mi Barbería" }]).select().maybeSingle();
  if (!shop) return null;
  await supabase.from("profiles").insert([{ id: user.id, barbershop_id: shop.id }]);
  return shop.id;
}

export default function App() {
  const [session, setSession] = useState(null)
  const [userShopId, setUserShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [showAddTurno, setShowAddTurno] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) { setUserShopId(null); setLoading(false); }
    });
    return () => { listener.subscription.unsubscribe() };
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchShop = async () => {
        const id = await getMyBarbershop(session.user);
        setUserShopId(id || await createBarbershopForUser(session.user));
        setLoading(false);
      }
      fetchShop();
    }
  }, [session]);

  if (loading) return <div style={loadingStyle}>CONECTANDO SISTEMA...</div>
  if (!session) return <Login />

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
          <small style={{ color: theme.muted, fontSize: "10px" }}>{tab.toUpperCase()}</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={iconButtonStyle}><Icons.Config /></button>
      </header>

      {/* VISTAS */}
      <main style={{ padding: "20px", paddingBottom: "100px" }}>
        {tab === "agenda" && <AgendaView shopId={userShopId} />}
        {tab === "barberos" && <BarberosView shopId={userShopId} />}
        {tab === "caja" && <CajaView shopId={userShopId} />}
      </main>

      {/* BOTÓN FLOTANTE */}
      <button onClick={() => setShowAddTurno(true)} style={fabStyle}><Icons.Plus /></button>

      {/* NAVEGACIÓN */}
      <nav style={navStyle}>
        <TabButton icon={<Icons.Calendar />} label="Agenda" active={tab === "agenda"} onClick={() => setTab("agenda")} />
        <TabButton icon={<Icons.Users />} label="Equipo" active={tab === "barberos"} onClick={() => setTab("barberos")} />
        <TabButton icon={<Icons.Cash />} label="Caja" active={tab === "caja"} onClick={() => setTab("caja")} />
      </nav>

      {/* MODALES */}
      {showConfig && <Modal title="CONFIGURACIÓN" onClose={() => setShowConfig(false)}>
        <button onClick={() => supabase.auth.signOut()} style={{...btnStyle, background: "#ff4444"}}>CERRAR SESIÓN</button>
      </Modal>}
      
      {showAddTurno && <Modal title="NUEVO TURNO" onClose={() => setShowAddTurno(false)}>
        <p style={{color: theme.muted}}>Formulario de reserva para Shop: {userShopId?.split('-')[0]}</p>
        <button style={btnStyle}>CONFIRMAR TURNO</button>
      </Modal>}
    </div>
  )
}

/* ================= COMPONENTES DE VISTA ================= */

function AgendaView({ shopId }) {
  const getNextDays = () => {
    return Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        name: d.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        num: d.getDate(),
        isToday: i === 0
      };
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom: "10px" }}>
        {getNextDays().map((d, i) => (
          <div key={i} style={d.isToday ? activeDayStyle : dayStyle}>
            <span style={{fontSize: "10px"}}>{d.name}</span>
            <span style={{fontSize: "16px", fontWeight: "900"}}>{d.num}</span>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <h3 style={{ color: theme.gold, margin: "0 0 15px 0", fontSize: "14px" }}>TURNOS DE HOY</h3>
        <Turno time="10:00" client="Rosario Michienzi" service="Corte Nabi Style" />
        <Turno time="11:30" client="Maxi Ortega" service="Barba + Perfilado" />
      </div>
    </div>
  );
}

function BarberosView() {
  return (
    <div style={cardStyle}>
      <h3 style={{ color: theme.gold, marginBottom: "15px" }}>MI EQUIPO</h3>
      <div style={turnoStyle}>Barbero Principal (Admin)</div>
      <button style={{...btnStyle, marginTop: "15px"}}>+ AGREGAR BARBERO</button>
    </div>
  );
}

function CajaView() {
  return (
    <div style={cardStyle}>
      <h3 style={{ color: theme.gold, marginBottom: "20px" }}>BALANCE DEL DÍA</h3>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "900" }}>
        <span>TOTAL:</span>
        <span style={{color: "#4cd964"}}>$45.500</span>
      </div>
      <hr style={{borderColor: theme.border, margin: "15px 0"}}/>
      <small style={{color: theme.muted}}>3 servicios realizados hoy</small>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Turno({ time, client, service }) {
  return (
    <div style={turnoStyle}>
      <div style={{color: theme.gold, fontWeight: "900"}}>{time}</div>
      <div>
        <div style={{fontSize: "14px"}}>{client}</div>
        <div style={{fontSize: "11px", color: theme.muted}}>{service}</div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
          <h2 style={{fontSize: "16px", color: theme.gold}}>{title}</h2>
          <button onClick={onClose} style={{background: "none", border: "none", color: "#fff"}}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: active ? theme.gold : theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", transition: "0.3s" }}>
      {icon} <span style={{ fontSize: "9px", fontWeight: active ? "900" : "400" }}>{label}</span>
    </button>
  );
}

/* ================= ESTILOS ================= */
const headerStyle = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, background: "#000", zIndex: 10 };
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "80px", background: "#0A0A0A", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: `1px solid ${theme.border}`, zIndex: 10 };
const cardStyle = { background: theme.card, padding: "20px", borderRadius: "12px", border: `1px solid ${theme.border}` };
const turnoStyle = { padding: "12px 0", borderBottom: `1px solid ${theme.border}`, display: "flex", gap: "15px", alignItems: "center" };
const btnStyle = { width: "100%", padding: "12px", background: theme.gold, border: "none", borderRadius: "8px", fontWeight: "900", cursor: "pointer" };
const fabStyle = { position: "fixed", bottom: "100px", right: "20px", width: "56px", height: "56px", borderRadius: "28px", background: theme.gold, color: "#000", border: "none", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: `0 4px 15px ${theme.gold}44`, zIndex: 9 };
const dayStyle = { minWidth: "55px", height: "65px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "10px", background: theme.card, color: theme.muted, border: `1px solid ${theme.border}` };
const activeDayStyle = { ...dayStyle, background: theme.gold, color: "#000", borderColor: theme.gold };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: "20px" };
const modalContent = { background: theme.card, padding: "25px", borderRadius: "15px", width: "100%", maxWidth: "400px", border: `1px solid ${theme.border}` };
const iconButtonStyle = { background: "none", border: "none", color: theme.gold, cursor: "pointer" };
const loadingStyle = { background: "#000", color: theme.gold, height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", letterSpacing: "2px" };
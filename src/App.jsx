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

/* ================= HELPERS (CONEXIÓN) ================= */
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

/* ================= COMPONENTE PRINCIPAL ================= */
export default function App() {
  const [session, setSession] = useState(null)
  const [userShopId, setUserShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("agenda")

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
    const fetchUserShop = async () => {
      if (session?.user) {
        setLoading(true);
        const id = await getMyBarbershop(session.user);
        setUserShopId(id || await createBarbershopForUser(session.user));
        setLoading(false);
      }
    }
    fetchUserShop();
  }, [session]);

  if (loading) return <div style={loadingStyle}>BARBERCONTROL PRO...</div>
  if (!session) return <Login />

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
          <small style={{ color: theme.muted, fontSize: "10px" }}>{tab.toUpperCase()}</small>
        </div>
        <button style={{ background: "none", border: "none", color: theme.gold }}><Icons.Config /></button>
      </header>

      {/* CONTENIDO DINÁMICO */}
      <main style={{ padding: "20px", paddingBottom: "100px" }}>
        {tab === "agenda" && <AgendaView shopId={userShopId} />}
        {tab === "barberos" && <div style={cardStyle}>Sección Barberos (Próximamente)</div>}
        {tab === "caja" && <div style={cardStyle}>Sección Caja (Próximamente)</div>}
      </main>

      {/* BOTÓN FLOTANTE (+) */}
      <button style={fabStyle}><Icons.Plus /></button>

      {/* NAVEGACIÓN */}
      <nav style={navStyle}>
        <TabButton icon={<Icons.Calendar />} label="Agenda" active={tab === "agenda"} onClick={() => setTab("agenda")} />
        <TabButton icon={<Icons.Users />} label="Equipo" active={tab === "barberos"} onClick={() => setTab("barberos")} />
        <TabButton icon={<Icons.Cash />} label="Caja" active={tab === "caja"} onClick={() => setTab("caja")} />
      </nav>
    </div>
  )
}

/* ================= VISTA DE AGENDA (DINÁMICA) ================= */
function AgendaView({ shopId }) {
  // Genera los próximos 6 días empezando desde HOY
  const getNextDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      days.push({
        name: date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        num: date.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const weekDays = getNextDays();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", overflowX: "auto", gap: "10px", paddingBottom: "10px" }}>
        {weekDays.map((d, index) => (
          <div key={index} style={d.isToday ? activeDayStyle : dayStyle}>
            {d.name}
            <br/>
            <span style={{fontSize: '12px'}}>{d.num}</span>
          </div>
        ))}
      </div>
      
      <div style={cardStyle}>
        <h3 style={{ color: theme.gold, margin: "0 0 15px 0", fontSize: "14px" }}>
          {weekDays[0].isToday ? "TURNOS DE HOY" : "PRÓXIMOS TURNOS"}
        </h3>
        <div style={turnoStyle}>
          <div><strong>16:30</strong> - Corte + Barba</div>
          <div style={{ color: theme.muted, fontSize: "12px" }}>Cliente: Juan Perez</div>
        </div>
        <div style={turnoStyle}>
          <div><strong>17:15</strong> - Corte Clásico</div>
          <div style={{ color: theme.muted, fontSize: "12px" }}>Cliente: Maxi Ortega</div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: active ? theme.gold : theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: active ? "900" : "400" }}>
      {icon} <span style={{ fontSize: "10px" }}>{label.toUpperCase()}</span>
    </button>
  );
}

/* ================= ESTILOS NABI STYLE ================= */
const headerStyle = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, background: "#000" };
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "80px", background: "#0A0A0A", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: `1px solid ${theme.border}`, paddingBottom: "10px" };
const cardStyle = { background: theme.card, padding: "20px", borderRadius: "12px", border: `1px solid ${theme.border}` };
const turnoStyle = { padding: "12px 0", borderBottom: `1px solid ${theme.border}` };
const dayStyle = { minWidth: "50px", height: "60px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "8px", background: theme.card, color: theme.muted, fontSize: "10px" };
const activeDayStyle = { ...dayStyle, background: theme.gold, color: "#000", fontWeight: "900" };
const fabStyle = { position: "fixed", bottom: "100px", right: "20px", width: "56px", height: "56px", borderRadius: "28px", background: theme.gold, color: "#000", border: "none", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)", cursor: "pointer" };
const loadingStyle = { background: "#000", color: "#D4AF37", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", letterSpacing: "2px" };
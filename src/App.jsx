import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

const theme = { bg: "#0A0A0A", card: "#121212", gold: "#D4AF37", text: "#FFFFFF", border: "#1F1F1F", muted: "#8E8E93", blue: "#007AFF", success: "#4cd964", danger: "#FF3B30" };

const Icons = {
  Config: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Cash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  WhatsApp: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973l-1.127 4.117 4.212-1.105a7.959 7.959 0 0 0 3.785.955h.003c4.369 0 7.927-3.558 7.929-7.926 0-2.12-.823-4.111-2.325-5.611zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.002 3.626-2.96 6.584-6.591 6.584z"/></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
};

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [loading, setLoading] = useState(true);
  
  // Persistence Logic
  const [turnos, setTurnos] = useState(() => JSON.parse(localStorage.getItem('bc_turnos')) || []);
  const [movimientos, setMovimientos] = useState(() => JSON.parse(localStorage.getItem('bc_movs')) || []);
  const [barberos, setBarberos] = useState(() => JSON.parse(localStorage.getItem('bc_barberos')) || [{ id: 1, name: "Maxi", comision: 50 }]);
  const [servicios, setServicios] = useState(() => JSON.parse(localStorage.getItem('bc_servicios')) || [{ name: "Corte", price: 5000 }, { name: "Barba", price: 3000 }]);
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('bc_config')) || { name: "NABI STYLE", whatsapp: "5491100000000" });

  const [showConfig, setShowConfig] = useState(false);
  const [showAddTurno, setShowAddTurno] = useState(false);

  useEffect(() => {
    localStorage.setItem('bc_turnos', JSON.stringify(turnos));
    localStorage.setItem('bc_movs', JSON.stringify(movimientos));
    localStorage.setItem('bc_barberos', JSON.stringify(barberos));
    localStorage.setItem('bc_servicios', JSON.stringify(servicios));
    localStorage.setItem('bc_config', JSON.stringify(config));
  }, [turnos, movimientos, barberos, servicios, config]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => { listener.subscription.unsubscribe() };
  }, []);

  if (loading) return <div style={loadingStyle}>BARBERCONTROL OS...</div>
  if (!session) return <Login />

  const handleAddTurno = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newTurno = {
      id: Date.now(),
      client: fd.get("client"),
      time: fd.get("time"),
      barberoId: parseInt(fd.get("barberoId")),
      service: fd.get("service"),
      status: "PENDIENTE"
    };
    setTurnos([...turnos, newTurno]);
    setShowAddTurno(false);
  };

  const handleCobrar = (turno) => {
    const serviceObj = servicios.find(s => s.name === turno.service) || { price: 5000 };
    const newMov = {
      id: Date.now(),
      turnoId: turno.id,
      barberoId: turno.barberoId,
      price: serviceObj.price,
      service: turno.service,
      date: new Date().toLocaleDateString()
    };
    setMovimientos([...movimientos, newMov]);
    setTurnos(turnos.filter(t => t.id !== turno.id));
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", position: "relative" }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "20px", fontWeight: "900" }}>{config.name}</h1>
          <small style={{ color: theme.muted, textTransform: "capitalize" }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={avatarStyle}>{config.name[0]}</button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "120px" }}>
        {tab === "agenda" && <AgendaSection turnos={turnos} handleCobrar={handleCobrar} />}
        {tab === "barberos" && <StaffSection movs={movimientos} barberos={barberos} />}
        {tab === "caja" && <CajaSection movs={movimientos} setMovs={setMovimientos} />}
      </main>

      <button onClick={() => setShowAddTurno(true)} style={fabStyle}><Icons.Plus /></button>

      <nav style={navStyle}>
        <TabButton icon={<Icons.Calendar />} label="Agenda" active={tab === "agenda"} onClick={() => setTab("agenda")} />
        <TabButton icon={<Icons.Users />} label="Staff" active={tab === "barberos"} onClick={() => setTab("barberos")} />
        <TabButton icon={<Icons.Cash />} label="Caja" active={tab === "caja"} onClick={() => setTab("caja")} />
      </nav>

      {showConfig && (
        <Modal title="CONFIGURACIÓN" onClose={() => setShowConfig(false)}>
          <div style={scrollArea}>
            <SectionTitle>MI BARBERÍA</SectionTitle>
            <input style={inputStyle} value={config.name} onChange={e => setConfig({...config, name: e.target.value.toUpperCase()})} placeholder="Nombre del local" />
            <input style={inputStyle} value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} placeholder="WhatsApp (549...)" />
            
            <SectionTitle>SERVICIOS Y PRECIOS</SectionTitle>
            {servicios.map((s, i) => (
              <div key={i} style={{display: "flex", gap: "10px", marginBottom: "8px"}}>
                <input style={{...inputStyle, flex: 2}} value={s.name} readOnly />
                <input style={{...inputStyle, flex: 1}} value={`$${s.price}`} readOnly />
              </div>
            ))}
            
            <SectionTitle>ACCIONES</SectionTitle>
            <button onClick={() => {
              const data = { turnos, movimientos, barberos, servicios, config };
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = "backup_barbercontrol.json"; a.click();
            }} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.border}`, color: "#fff", marginBottom: "10px"}}>DESCARGAR COPIA JSON</button>
            
            <button onClick={() => { if(confirm("¿RESET A FÁBRICA? Se borrará todo.")) localStorage.clear(); window.location.reload(); }} style={{...btnStyle, background: theme.danger, color: "#fff"}}>RESETEAR A FÁBRICA</button>
            <button onClick={() => supabase.auth.signOut()} style={{...btnStyle, background: "transparent", border: "1px solid #fff", color: "#fff", marginTop: "10px"}}>CERRAR SESIÓN</button>
          </div>
        </Modal>
      )}

      {showAddTurno && (
        <Modal title="NUEVO TURNO" onClose={() => setShowAddTurno(false)}>
          <form onSubmit={handleAddTurno} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
            <input name="client" style={inputStyle} placeholder="Nombre del cliente" required />
            <input name="time" type="time" style={inputStyle} required />
            <select name="barberoId" style={inputStyle}>
              {barberos.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select name="service" style={inputStyle}>
              {servicios.map(s => <option key={s.name} value={s.name}>{s.name} - ${s.price}</option>)}
            </select>
            <button type="submit" style={btnStyle}>GUARDAR TURNO</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

// --- SUB-SECCIONES ---

function AgendaSection({ turnos, handleCobrar }) {
  const stats = {
    total: turnos.length,
    enCurso: turnos.filter(t => t.status === "EN CURSO").length,
    pendientes: turnos.filter(t => t.status === "PENDIENTE").length
  };
  return (
    <div>
      <div style={{display: "flex", gap: "10px", marginBottom: "25px"}}>
        <StatSmall label="Total" val={stats.total} />
        <StatSmall label="En curso" val={stats.enCurso} />
        <StatSmall label="Pendientes" val={stats.pendientes} />
      </div>
      <SectionTitle>PRÓXIMOS TURNOS</SectionTitle>
      {turnos.length === 0 ? (
        <div style={{textAlign: "center", padding: "40px", color: theme.muted}}>No hay turnos para hoy. Agregá el primero!</div>
      ) : (
        turnos.map(t => (
          <div key={t.id} style={cardStyle}>
            <div style={rowBetween}>
              <div>
                <span style={{color: theme.gold, fontWeight: "900"}}>{t.time}</span>
                <div style={{fontSize: "16px", fontWeight: "700"}}>{t.client}</div>
                <small style={{color: theme.muted}}>{t.service}</small>
              </div>
              <button onClick={() => handleCobrar(t)} style={cobrarBtn}>COBRAR</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StaffSection({ movs, barberos }) {
  const totalBruto = movs.reduce((s, m) => s + m.price, 0);
  return (
      <div style={cardStyle}>
        <SectionTitle>STAFF</SectionTitle>
        <div style={rowBetween}><span>Cortes hoy:</span> <span>{movs.length}</span></div>
        <div style={rowBetween}><span>Ingreso Bruto:</span> <span style={{color: theme.success}}>${totalBruto}</span></div>
      </div>
  );
}

function CajaSection({ movs, setMovs }) {
  const total = movs.reduce((s, m) => s + m.price, 0);
  return (
    <div>
      <div style={cardStyle}>
        <div style={rowBetween}><span style={{fontSize: "18px"}}>TOTAL HOY</span> <span style={{fontSize: "24px", color: theme.gold, fontWeight: "900"}}>${total}</span></div>
      </div>
      <SectionTitle>MOVIMIENTOS</SectionTitle>
      {movs.map(m => <div key={m.id} style={cardStyle}><div style={rowBetween}><span>{m.service}</span> <span style={{color: theme.success}}>${m.price}</span></div></div>)}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
const Modal = ({ title, onClose, children }) => (
  <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "flex-end", zIndex: 50}}>
    <div style={{background: theme.card, width: "100%", borderRadius: "20px 20px 0 0", padding: "20px"}}>
      <div style={rowBetween}><h2 style={{color: theme.gold, margin: 0}}>{title}</h2> <button onClick={onClose} style={{background: "none", border: "none", color: theme.muted, fontSize: "24px", cursor: "pointer"}}>✕</button></div>
      {children}
    </div>
  </div>
);

const TabButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{background: "none", border: "none", color: active ? theme.gold : theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", fontSize: "12px"}}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatSmall = ({ label, val }) => (
  <div style={{flex: 1, background: theme.card, padding: "15px", borderRadius: "10px", textAlign: "center", border: `1px solid ${theme.border}`}}>
    <div style={{fontSize: "12px", color: theme.muted}}>{label}</div>
    <div style={{fontSize: "24px", fontWeight: "900", color: theme.gold}}>{val}</div>
  </div>
);

const SectionTitle = ({ children }) => <h3 style={{color: theme.gold, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginTop: "20px", marginBottom: "10px"}}>{children}</h3>;

// --- ESTILOS ---
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: `1px solid ${theme.border}` };
const avatarStyle = { background: theme.gold, color: theme.bg, width: "40px", height: "40px", borderRadius: "50%", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "16px" };
const navStyle = { position: "fixed", bottom: 0, width: "100%", display: "flex", justifyContent: "space-around", padding: "15px", background: theme.card, borderTop: `1px solid ${theme.border}`, zIndex: 40 };
const fabStyle = { position: "fixed", bottom: "80px", right: "20px", width: "56px", height: "56px", borderRadius: "50%", background: theme.gold, color: theme.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, fontWeight: "900", boxShadow: "0 4px 12px rgba(0,0,0,.3)" };
const cardStyle = { background: theme.card, padding: "15px", borderRadius: "10px", marginBottom: "10px", border: `1px solid ${theme.border}` };
const rowBetween = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const inputStyle = { background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, padding: "12px", borderRadius: "8px", fontSize: "16px", fontFamily: "inherit" };
const btnStyle = { background: theme.gold, color: theme.bg, padding: "12px 20px", borderRadius: "8px", border: "none", fontWeight: "900", cursor: "pointer", width: "100%", textTransform: "uppercase", fontSize: "14px" };
const cobrarBtn = { background: theme.success, color: theme.bg, padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", fontSize: "12px" };
const scrollArea = { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "60vh", overflowY: "auto" };
const loadingStyle = { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: theme.bg, color: theme.gold, fontSize: "24px", fontWeight: "900", letterSpacing: "2px" };
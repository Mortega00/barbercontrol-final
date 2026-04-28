import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

const theme = { bg: "#0A0A0A", card: "#121212", gold: "#D4AF37", text: "#FFFFFF", border: "#1F1F1F", muted: "#8E8E93", blue: "#007AFF", success: "#4cd964" };

const Icons = {
  Config: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Cash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  WhatsApp: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973l-1.127 4.117 4.212-1.105a7.959 7.959 0 0 0 3.785.955h.003c4.369 0 7.927-3.558 7.929-7.926 0-2.12-.823-4.111-2.325-5.611zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.002 3.626-2.96 6.584-6.591 6.584z"/></svg>
};

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [loading, setLoading] = useState(true);
  
  const [turnos, setTurnos] = useState(() => JSON.parse(localStorage.getItem('bc_turnos')) || []);
  const [movimientos, setMovimientos] = useState(() => JSON.parse(localStorage.getItem('bc_movs')) || []);
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('bc_config')) || {
    name: "NABI STYLE", whatsapp: "5491100000000", comision: 50, services: ["Corte", "Barba", "Combo"]
  });

  const [showConfig, setShowConfig] = useState(false);
  const [showAddTurno, setShowAddTurno] = useState(false);

  useEffect(() => {
    localStorage.setItem('bc_turnos', JSON.stringify(turnos));
    localStorage.setItem('bc_movs', JSON.stringify(movimientos));
    localStorage.setItem('bc_config', JSON.stringify(config));
  }, [turnos, movimientos, config]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => { listener.subscription.unsubscribe() };
  }, []);

  if (loading) return <div style={loadingStyle}>BARBERCONTROL OS...</div>
  if (!session) return <Login />

  const notifyWhatsApp = (turno) => {
    const msg = `Hola! 💈 Confirmamos tu turno para hoy a las ${turno.time}. ¡Te esperamos! ✨`;
    window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const descargarRespaldo = () => {
    const data = { turnos, movimientos, config, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `backup_barber_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>{config.name}</h1>
          <small style={{ color: theme.muted, fontSize: "10px" }}>{tab.toUpperCase()}</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={avatarStyle}>M</button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "120px" }}>
        {tab === "agenda" && <AgendaSection turnos={turnos} setTurnos={setTurnos} onNotify={notifyWhatsApp} />}
        {tab === "barberos" && <StaffSection movs={movimientos} comision={config.comision} />}
        {tab === "caja" && <CajaSection movs={movimientos} setMovs={setMovimientos} onRespaldo={descargarRespaldo} />}
      </main>

      <button onClick={() => setShowAddTurno(true)} style={fabStyle}><Icons.Plus /></button>

      <nav style={navStyle}>
        <TabButton icon={<Icons.Calendar />} label="Agenda" active={tab === "agenda"} onClick={() => setTab("agenda")} />
        <TabButton icon={<Icons.Users />} label="Equipo" active={tab === "barberos"} onClick={() => setTab("barberos")} />
        <TabButton icon={<Icons.Cash />} label="Caja" active={tab === "caja"} onClick={() => setTab("caja")} />
      </nav>

      {showConfig && (
        <Modal title="CONFIGURACIÓN" onClose={() => setShowConfig(false)}>
          <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
            <label style={labelStyle}>NOMBRE BARBERÍA</label>
            <input style={inputStyle} value={config.name} onChange={e => setConfig({...config, name: e.target.value.toUpperCase()})} />
            <button onClick={descargarRespaldo} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.border}`, color: "#fff"}}>📥 RESPALDO JSON</button>
            <button onClick={() => supabase.auth.signOut()} style={{...btnStyle, background: "#ff4444", marginTop: "20px", color: "#fff"}}>CERRAR SESIÓN</button>
          </div>
        </Modal>
      )}

      {showAddTurno && (
        <Modal title="NUEVO TURNO" onClose={() => setShowAddTurno(false)}>
          <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            <input style={inputStyle} placeholder="Nombre Cliente" id="newClient" />
            <input style={inputStyle} type="time" id="newTime" />
            <button onClick={() => {
              const client = document.getElementById('newClient').value;
              const time = document.getElementById('newTime').value;
              if(client && time) {
                setTurnos([...turnos, { id: Date.now(), client, time, service: "Corte", status: "ESPERANDO" }]);
                setShowAddTurno(false);
              }
            }} style={btnStyle}>CONFIRMAR TURNO</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AgendaSection({ turnos, setTurnos, onNotify }) {
  const toggleEstado = (id) => {
    const estados = ["ESPERANDO", "CONFIRMADO", "EN CURSO"];
    setTurnos(turnos.map(t => t.id === id ? { ...t, status: estados[(estados.indexOf(t.status) + 1) % estados.length] } : t));
  };
  return (
    <div>
      {turnos.map(t => (
        <div key={t.id} style={cardStyle}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div onClick={() => toggleEstado(t.id)} style={{cursor: "pointer"}}>
              <span style={{...statusBadge, background: t.status === "CONFIRMADO" ? theme.gold : t.status === "EN CURSO" ? theme.blue : theme.border}}>{t.status}</span>
              <div style={{fontWeight: "900", fontSize: "16px", marginTop: "8px"}}>{t.time} - {t.client}</div>
            </div>
            <button onClick={() => onNotify(t)} style={waButtonStyle}><Icons.WhatsApp /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StaffSection({ movs, comision }) {
  const stats = movs.reduce((acc, m) => {
    acc.total += m.price;
    acc.barbero += (m.price * comision) / 100;
    return acc;
  }, { total: 0, barbero: 0 });
  return (
    <div style={cardStyle}>
      <h2 style={{color: theme.gold, fontSize: "14px", marginBottom: "20px"}}>COMISIONES ({comision}%)</h2>
      <div style={rowBetween}><span>Bruto:</span> <span>${stats.total}</span></div>
      <div style={rowBetween}><span>Barbero:</span> <span style={{color: theme.success}}>${stats.barbero}</span></div>
      <div style={{...rowBetween, marginTop: "10px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px", fontWeight: "900"}}>
        <span>Local:</span> <span style={{color: theme.gold}}>${stats.total - stats.barbero}</span>
      </div>
    </div>
  );
}

function CajaSection({ movs, setMovs, onRespaldo }) {
  const total = movs.reduce((sum, m) => sum + m.price, 0);
  return (
    <div>
      <div style={{...cardStyle, background: theme.gold, color: "#000", textAlign: "center", padding: "30px"}}>
        <small style={{fontWeight: "700"}}>TOTAL DEL DÍA</small>
        <div style={{fontSize: "42px", fontWeight: "900"}}>${total}</div>
      </div>
      <button onClick={() => setMovs([...movs, { service: "Corte", price: 5000, time: new Date().toLocaleTimeString() }])} style={{...btnStyle, margin: "20px 0"}}>⚡ COBRAR CORTE ($5000)</button>
      <button onClick={() => { if(confirm("¿Cerrar caja?")) { onRespaldo(); setMovs([]); } }} style={{...btnStyle, background: "transparent", border: `1px solid #ff4444`, color: "#ff4444"}}>CERRAR CAJA</button>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: active ? theme.gold : theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
      {icon} <span style={{ fontSize: "10px", fontWeight: active ? "900" : "500" }}>{label.toUpperCase()}</span>
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
          <h2 style={{fontSize: "14px", color: theme.gold}}>{title}</h2>
          <button onClick={onClose} style={{background: "none", border: "none", color: "#fff", fontSize: "20px"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const headerStyle = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#0A0A0A", zIndex: 10 };
const avatarStyle = { width: "35px", height: "35px", borderRadius: "50%", background: theme.gold, color: "#000", border: "none", fontWeight: "900" };
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "85px", background: "#0D0D0D", display: "flex", borderTop: `1px solid ${theme.border}`, paddingBottom: "10px" };
const cardStyle = { background: theme.card, padding: "18px", borderRadius: "16px", marginBottom: "12px", border: `1px solid ${theme.border}` };
const fabStyle = { position: "fixed", bottom: "105px", right: "20px", width: "60px", height: "60px", borderRadius: "30px", background: theme.gold, color: "#000", border: "none", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: `0 8px 25px ${theme.gold}44` };
const btnStyle = { width: "100%", padding: "15px", borderRadius: "12px", border: "none", fontWeight: "900", background: theme.gold, color: "#000" };
const inputStyle = { background: "#1A1A1A", border: `1px solid ${theme.border}`, padding: "12px", borderRadius: "8px", color: "#fff" };
const labelStyle = { fontSize: "10px", color: theme.muted, fontWeight: "700" };
const statusBadge = { padding: "4px 10px", borderRadius: "20px", fontSize: "9px", fontWeight: "900", color: "#000" };
const waButtonStyle = { background: "#25D366", border: "none", borderRadius: "50%", width: "35px", height: "35px", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 1000 };
const modalBox = { background: theme.card, width: "100%", padding: "30px", borderTopLeftRadius: "25px", borderTopRightRadius: "25px", borderTop: `2px solid ${theme.gold}` };
const rowBetween = { display: "flex", justifyContent: "space-between", padding: "8px 0" };
const loadingStyle = { background: "#000", color: theme.gold, height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900" };
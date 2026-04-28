import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

// THEME & CONSTANTS
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
  const [userShopId, setUserShopId] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [loading, setLoading] = useState(true);
  
  // PERSISTENCIA LOCAL (Igual que Replit)
  const [turnos, setTurnos] = useState(() => JSON.parse(localStorage.getItem('bc_turnos')) || []);
  const [movimientos, setMovimientos] = useState(() => JSON.parse(localStorage.getItem('bc_movs')) || []);
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('bc_config')) || {
    name: "NABI STYLE", whatsapp: "5491100000000", comision: 50, services: ["Corte", "Barba", "Combo"]
  });

  // MODALES
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
      if (!data.session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => { listener.subscription.unsubscribe() };
  }, []);

  if (loading && !session) return <div style={loadingStyle}>BARBERCONTROL OS...</div>
  if (!session) return <Login />

  // FUNCIONES PRO
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
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* HEADER PROFESIONAL */}
      <header style={headerStyle}>
        <div style={{animation: "fadeIn 0.5s ease"}}>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>{config.name}</h1>
          <small style={{ color: theme.muted, fontSize: "10px", fontWeight: "700" }}>{tab.toUpperCase()}</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={avatarStyle}>M</button>
      </header>

      {/* VISTAS CON ANIMACIÓN */}
      <main style={{ padding: "20px", paddingBottom: "120px", height: "calc(100vh - 80px)", overflowY: "auto" }}>
        {tab === "agenda" && <AgendaSection turnos={turnos} setTurnos={setTurnos} onNotify={notifyWhatsApp} />}
        {tab === "barberos" && <StaffSection movs={movimientos} comision={config.comision} />}
        {tab === "caja" && <CajaSection movs={movimientos} setMovs={setMovimientos} onRespaldo={descargarRespaldo} />}
      </main>

      <button onClick={() => setShowAddTurno(true)} style={fabStyle}><Icons.Plus /></button>

      {/* NAV BAR NATIVA */}
      <nav style={navStyle}>
        <TabButton icon={<Icons.Calendar />} label="Agenda" active={tab === "agenda"} onClick={() => setTab("agenda")} />
        <TabButton icon={<Icons.Users />} label="Equipo" active={tab === "barberos"} onClick={() => setTab("barberos")} />
        <TabButton icon={<Icons.Cash />} label="Caja" active={tab === "caja"} onClick={() => setTab("caja")} />
      </nav>

      {/* MODALES PRO */}
      {showConfig && (
        <Modal title="CONFIGURACIÓN" onClose={() => setShowConfig(false)}>
          <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            <label style={labelStyle}>NOMBRE BARBERÍA</label>
            <input style={inputStyle} value={config.name} onChange={e => setConfig({...config, name: e.target.value.toUpperCase()})} />
            <button onClick={descargarRespaldo} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.border}`}}>📥 DESCARGAR BACKUP</button>
            <button onClick={() => supabase.auth.signOut()} style={{...btnStyle, background: "#ff4444", marginTop: "20px"}}>CERRAR SESIÓN</button>
          </div>
        </Modal>
      )}

      {showAddTurno && (
        <Modal title="NUEVO TURNO" onClose={() => setShowAddTurno(false)}>
           {/* Aquí va tu formulario de carga de Replit */}
           <button onClick={() => setShowAddTurno(false)} style={btnStyle}>GUARDAR TURNO</button>
        </Modal>
      )}
    </div>
  )
}

/* ================= SECCIONES (LOGICA REPLIT) ================= */

function AgendaSection({ turnos, setTurnos, onNotify }) {
  const toggleEstado = (id) => {
    const estados = ["ESPERANDO", "CONFIRMADO", "EN CURSO"];
    setTurnos(turnos.map(t => {
      if (t.id === id) {
        const nextIdx = (estados.indexOf(t.status) + 1) % estados.length;
        return { ...t, status: estados[nextIdx] };
      }
      return t;
    }));
  };

  return (
    <div style={{animation: "slideUp 0.4s ease"}}>
      <h3 style={{fontSize: "12px", color: theme.muted, marginBottom: "15px"}}>PRÓXIMOS TURNOS</h3>
      {turnos.length === 0 ? <p style={{color: theme.muted, textAlign: "center", marginTop: "40px"}}>No hay turnos agendados.</p> : 
        turnos.map(t => (
          <div key={t.id} style={cardStyle}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <div onClick={() => toggleEstado(t.id)} style={{cursor: "pointer"}}>
                <span style={{...statusBadge, background: t.status === "CONFIRMADO" ? theme.gold : t.status === "EN CURSO" ? theme.blue : theme.border}}>
                  {t.status}
                </span>
                <div style={{fontWeight: "900", fontSize: "16px", marginTop: "8px"}}>{t.time} - {t.client}</div>
                <div style={{color: theme.muted, fontSize: "12px"}}>{t.service}</div>
              </div>
              <button onClick={() => onNotify(t)} style={waButtonStyle}><Icons.WhatsApp /></button>
            </div>
          </div>
        ))
      }
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
    <div style={{animation: "slideUp 0.4s ease"}}>
      <div style={cardStyle}>
        <h2 style={{color: theme.gold, fontSize: "14px", marginBottom: "20px"}}>EQUIPO Y COMISIONES ({comision}%)</h2>
        <div style={rowBetween}><span>Ingreso Bruto:</span> <span>${stats.total}</span></div>
        <div style={rowBetween}><span>Para el Barbero:</span> <span style={{color: theme.success}}>${stats.barbero}</span></div>
        <div style={{...rowBetween, marginTop: "10px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px", fontWeight: "900"}}>
          <span>Ganancia Local:</span> <span style={{color: theme.gold}}>${stats.total - stats.barbero}</span>
        </div>
      </div>
    </div>
  );
}

function CajaSection({ movs, setMovs, onRespaldo }) {
  const total = movs.reduce((sum, m) => sum + m.price, 0);
  
  return (
    <div style={{animation: "slideUp 0.4s ease"}}>
      <div style={{...cardStyle, background: theme.gold, color: "#000", textAlign: "center", padding: "30px"}}>
        <small style={{fontWeight: "700"}}>TOTAL RECAUDADO HOY</small>
        <div style={{fontSize: "42px", fontWeight: "900"}}>${total}</div>
      </div>
      
      <button style={{...btnStyle, margin: "20px
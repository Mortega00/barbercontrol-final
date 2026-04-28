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
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
};

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [loading, setLoading] = useState(true);
  
  // Persistencia
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

  // Handlers
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
    const serviceObj = servicios.find(s => s.name === turno.service) || { price: 0 };
    const newMov = {
      id: Date.now(),
      barberoId: turno.barberoId,
      price: serviceObj.price,
      service: turno.service,
      time: new Date().toLocaleTimeString()
    };
    setMovimientos([...movimientos, newMov]);
    setTurnos(turnos.filter(t => t.id !== turno.id));
  };

  const addBarbero = () => {
    const name = prompt("Nombre del barbero:");
    const comision = prompt("% de comisión:");
    if(name && comision) setBarberos([...barberos, { id: Date.now(), name, comision: parseInt(comision) }]);
  };

  const addServicio = () => {
    const name = prompt("Nombre del servicio:");
    const price = prompt("Precio:");
    if(name && price) setServicios([...servicios, { name, price: parseInt(price) }]);
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "20px", fontWeight: "900" }}>{config.name}</h1>
          <small style={{ color: theme.muted, textTransform: "capitalize" }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={avatarStyle}>{config.name[0]}</button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "120px" }}>
        {tab === "agenda" && <AgendaSection turnos={turnos} handleCobrar={handleCobrar} />}
        {tab === "barberos" && <StaffSection movs={movimientos} barberos={barberos} addBarbero={addBarbero} />}
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
            <button onClick={addServicio} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.gold}`, color: theme.gold, marginBottom: "20px"}}>+ AGREGAR SERVICIO</button>
            
            <SectionTitle>MENSAJE CLIENTES NUEVOS</SectionTitle>
            <div style={copyBox}>
               <p style={{fontSize: "12px", color: theme.muted, margin: 0}}>Hola BarberControl 💈, quiero agendar un turno...</p>
               <button onClick={() => navigator.clipboard.writeText("Hola BarberControl 💈, quiero agendar un turno para hoy...")} style={{background: "none", border: "none", color: theme.gold}}><Icons.Copy /></button>
            </div>

            <button onClick={() => {
              const data = { turnos, movimientos, barberos, servicios, config };
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = "backup_barber.json"; a.click();
            }} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.border}`, color: "#fff", marginTop: "20px"}}>DESCARGAR COPIA JSON</button>
            
            <button onClick={() => { if(confirm("¿RESET?")) { localStorage.clear(); window.location.reload(); }}} style={{...btnStyle, background: theme.danger, color: "#fff", marginTop: "10px"}}>RESETEAR A FÁBRICA</button>
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

function AgendaSection({ turnos, handleCobrar }) {
  const stats = { total: turnos.length, pendientes: turnos.filter(t => t.status === "PENDIENTE").length };
  return (
    <div>
      <div style={{display: "flex", gap: "10px", marginBottom: "25px"}}>
        <StatSmall label="Total" val={stats.total} />
        <StatSmall label="Pendientes" val={stats.pendientes} />
      </div>
      <SectionTitle>PRÓXIMOS TURNOS</SectionTitle>
      {turnos.length === 0 ? (
        <div style={{textAlign: "center", padding: "40px", color: theme.muted}}>No hay turnos para hoy.</div>
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

function StaffSection({ movs, barberos, addBarbero }) {
  const totalBruto = movs.reduce((s, m) => s + m.price, 0);
  return (
    <div>
      <div style={cardStyle}>
        <SectionTitle>STAFF</SectionTitle>
        <div style={rowBetween}><span>Cortes hoy:</span> <span>{movs.length}</span></div>
        <div style={rowBetween}><span>Ingreso Bruto:</span> <span style={{color: theme.success}}>${totalBruto}</span></div>
      </div>
      {barberos.map(b => {
        const bMovs = movs.filter(m => m.barberoId === b.id);
        const bTotal = bMovs.reduce((s, m) => s + m.price, 0);
        const bGana = (bTotal * b.comision) / 100;
        return (
          <div key={b.id} style={{...cardStyle, borderLeft: `4px solid ${theme.gold}`}}>
            <div style={rowBetween}><div style={{fontWeight: "900"}}>{b.name}</div><span style={statusBadge}>{b.comision}% comision</span></div>
            <div style={{...rowBetween, marginTop: "10px"}}><small>Cortes: {bMovs.length}</small><small style={{color: theme.success}}>Gana: ${bGana}</small></div>
          </div>
        );
      })}
      <button onClick={addBarbero} style={{...btnStyle, background: theme.card, border: `1px solid ${theme.gold}`, color: theme.gold}}>+ NUEVO BARBERO</button>
    </div>
  );
}

function CajaSection({ movs, setMovs }) {
  const total = movs.reduce((s, m) => s + m.price, 0);
  return (
    <div>
      <div style={{...cardStyle, background: theme.gold, color: "#000", textAlign: "center", padding: "30px"}}>
        <small style={{fontWeight: "900"}}>TOTAL RECAUDADO HOY</small>
        <div style={{fontSize: "48px", fontWeight: "900"}}>${total}</div>
      </div>
      <SectionTitle>MOVIMIENTOS DEL DÍA</SectionTitle>
      {movs.length === 0 ? <div style={{color: theme.muted, textAlign: "center"}}>Sin cobros registrados</div> : 
        movs.map(m => (
          <div key={m.id} style={{...rowBetween, borderBottom: `1px solid ${theme.border}`, padding: "12px 0"}}>
            <span>{m.service}</span><span style={{fontWeight: "700"}}>${m.price}</span>
          </div>
        ))
      }
      <button onClick={() => { if(confirm("¿Cerrar caja?")) setMovs([]); }} style={{...btnStyle, marginTop: "30px", background: "transparent", border: `1px solid ${theme.danger}`, color: theme.danger}}>CERRAR CAJA</button>
    </div>
  );
}

// Estilos y componentes menores
const SectionTitle = ({ children }) => <h3 style={{fontSize: "12px", color: theme.muted, letterSpacing: "1px", marginBottom: "15px", marginTop: "20px"}}>{children.toUpperCase()}</h3>;
const StatSmall = ({ label, val }) => (<div style={{background: theme.card, padding: "15px", borderRadius: "12px", flex: 1, textAlign: "center", border: `1px solid ${theme.border}`}}><div style={{fontSize: "20px", fontWeight: "900", color: theme.gold}}>{val}</div><small style={{fontSize: "10px", color: theme.muted}}>{label}</small></div>);
function TabButton({ icon, label, active, onClick }) { return (<button onClick={onClick} style={{ background: "none", border: "none", color: active ? theme.gold : theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>{icon} <span style={{ fontSize: "10px", fontWeight: active ? "900" : "500" }}>{label.toUpperCase()}</span></button>); }
function Modal({ title, children, onClose }) { return (<div style={overlay}><div style={modalBox}><div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}><h2 style={{fontSize: "14px", color: theme.gold}}>{title}</h2><button onClick={onClose} style={{background: "none", border: "none", color: "#fff", fontSize: "24px"}}>×</button></div>{children}</div></div>); }

const headerStyle = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: theme.bg, zIndex: 10 };
const avatarStyle = { width: "40px", height: "40px", borderRadius: "12px", background: theme.gold, color: "#000", border: "none", fontWeight: "900" };
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "85px", background: "#0D0D0D", display: "flex", borderTop: `1px solid ${theme.border}`, paddingBottom: "10px", zIndex: 100 };
const cardStyle = { background: theme.card, padding: "20px", borderRadius: "16px", marginBottom: "15px", border: `1px solid ${theme.border}` };
const fabStyle = { position: "fixed", bottom: "105px", right: "20px", width: "65px", height: "65px", borderRadius: "20px", background: theme.gold, color: "#000", border: "none", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: `0 8px 30px ${theme.gold}55`, zIndex: 90 };
const btnStyle = { width: "100%", padding: "16px", borderRadius: "12px", border: "none", fontWeight: "900", background: theme.gold, color: "#000" };
const inputStyle = { background: "#1A1A1A", border: `1px solid ${theme.border}`, padding: "14px", borderRadius: "10px", color: "#fff", width: "100%", marginBottom: "10px" };
const statusBadge = { padding: "4px 8px", background: theme.border, borderRadius: "6px", fontSize: "10px", fontWeight: "700" };
const cobrarBtn = { background: theme.success, color: "#000", border: "none", borderRadius: "8px", padding: "8px 15px", fontWeight: "900" };
const copyBox = { background: "#1A1A1A", padding: "15px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 1000 };
const modalBox = { background: theme.card, width: "100%", padding: "30px", borderTopLeftRadius: "30px", borderTopRightRadius: "30px", maxHeight: "90vh", overflowY: "auto" };
const scrollArea = { display: "flex", flexDirection: "column" };
const rowBetween = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const loadingStyle = { background: "#000", color: theme.gold, height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900" };
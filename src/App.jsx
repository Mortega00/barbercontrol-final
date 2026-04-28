import { useState, useEffect, useRef } from "react"

/* ================= ICONOS SVG ================= */
const Icons = {
  Agenda: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Staff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>,
  Caja: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  Config: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Chevron: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  WhatsApp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.1c4.6 0 8.4 3.8 8.4 8.4z"></path><path d="M17.4 15.5l-3.4-1.2a1 1 0 0 0-1 .2l-1.1 1.4a13 13 0 0 1-4.4-4.4l1.4-1.1a1 1 0 0 0 .2-1L7.9 6a1 1 0 0 0-1-.7h-1.9a1 1 0 0 0-1 1.1c.3 4.1 2 7.8 4.7 10.5a13.5 13.5 0 0 0 10.5 4.7 1 1 0 0 0 1.1-1v-1.9a1 1 0 0 0-.7-1z"></path></svg>
}

/* ================= HELPERS ================= */
const theme = { bg: "#0A0A0A", card: "#141414", gold: "#D4AF37", text: "#FFFFFF", border: "#222", muted: "#666" }
const getLS = (key, def) => { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : def; } catch { return def; } }
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const formato = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

const generarHorarios = () => {
  const h = [];
  for (let i = 9; i <= 21; i++) {
    const hora = i < 10 ? `0${i}` : `${i}`;
    h.push(`${hora}:00`);
    if (i < 21) h.push(`${hora}:30`);
  }
  return h;
}

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sync, setSync] = useState(0)

  const triggerSync = () => setSync(s => s + 1)

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
        <button onClick={() => setShowConfig(true)} style={{ background: "none", border: "none", color: theme.gold, cursor: "pointer" }}><Icons.Config /></button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "110px" }}>
        {tab === "agenda" && <Agenda sync={sync} onUpdate={triggerSync} showModal={showAddModal} closeModal={() => setShowAddModal(false)} />}
        {tab === "barberos" && <Barberos sync={sync} onUpdate={triggerSync} />}
        {tab === "caja" && <Caja sync={sync} />}
      </main>

      {/* BOTÓN FLOTANTE (+) SOLO EN AGENDA */}
      {tab === "agenda" && (
        <button onClick={() => setShowAddModal(true)} style={floatingBtn}>
          <Icons.Plus />
        </button>
      )}

      <nav style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.8)", backdropFilter: "blur(15px)", padding: "8px", borderRadius: "30px", display: "flex", gap: "5px", border: `1px solid ${theme.border}`, zIndex: 10 }}>
        {[{ id: "agenda", label: "Agenda", icon: <Icons.Agenda /> }, { id: "barberos", label: "Staff", icon: <Icons.Staff /> }, { id: "caja", label: "Caja", icon: <Icons.Caja /> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? theme.gold : "transparent", color: tab === t.id ? "black" : theme.text, border: "none", padding: "10px 18px", borderRadius: "25px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"
          }}>{t.icon} {tab === t.id && t.label.toUpperCase()}</button>
        ))}
      </nav>

      <ConfigDrawer isOpen={showConfig} close={() => setShowConfig(false)} onUpdate={triggerSync} />
    </div>
  )
}

/* ================= AGENDA CON MODAL Y WHATSAPP ================= */
function Agenda({ sync, onUpdate, showModal, closeModal }) {
  const [turnos, setTurnos] = useState(() => getLS("turnos", []))
  const [f, setF] = useState({ nombre: "", hora: "", servicio: "", barbero: "" })
  const [isOpenHoras, setIsOpenHoras] = useState(false)
  
  const servicios = getLS("servicios", [{ nombre: "Corte", precio: 5000 }])
  const barberos = getLS("barberos", [])
  const listaHorarios = generarHorarios()

  useEffect(() => { setTurnos(getLS("turnos", [])) }, [sync])
  useEffect(() => { 
    if(servicios.length > 0 && !f.servicio) setF(prev => ({...prev, servicio: servicios[0].nombre}))
    if(barberos.length > 0 && !f.barbero) setF(prev => ({...prev, barbero: barberos[0].nombre}))
  }, [servicios, barberos])

  const handleAdd = (e) => {
    if(e) e.preventDefault();
    if (!f.nombre || !f.hora || !f.barbero) return
    const nuevo = [{ id: Date.now(), ...f }, ...turnos]
    setLS("turnos", nuevo); setTurnos(nuevo); setF({ ...f, nombre: "" }); closeModal(); onUpdate()
  }

  const cobrar = (t) => {
    const s = servicios.find(x => x.nombre === t.servicio) || { precio: 0 }
    const total = (Number(localStorage.getItem("total")) || 0) + s.precio
    setLS("total", total); setLS("movimientos", [{ ...t, precio: s.precio }, ...getLS("movimientos", [])])
    const rest = turnos.filter(x => x.id !== t.id); setLS("turnos", rest); setTurnos(rest); onUpdate()
  }

  const confirmWhatsApp = (t) => {
    const msg = `Hola ${t.nombre}, confirmamos tu turno para hoy a las ${t.hora} hs para el servicio de ${t.servicio}. ¡Te esperamos en BarberControl! ✂️⚡`;
    window.open(`https://wa.me/${localStorage.getItem("telefono")}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <>
      <h2 style={titleStyle}>AGENDA DEL DÍA</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
         <button onClick={() => window.open('https://w.app/ozsw9y', '_blank')} style={btnGhost}><Icons.WhatsApp /> WHATSAPP BARBERÍA</button>
      </div>

      {turnos.length === 0 && <p style={{ textAlign: "center", padding: "40px", color: theme.muted }}>No hay turnos para hoy. <br/> Agregá tu primer turno con el (+)</p>}
      
      {turnos.map(t => (
        <div key={t.id} style={cardStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{t.hora} hs - <span style={{ color: theme.gold }}>{t.nombre}</span></div>
            <div style={{ fontSize: "11px", color: theme.muted }}>{t.servicio.toUpperCase()} | <span style={{ color: "white" }}>{t.barbero}</span></div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => confirmWhatsApp(t)} style={{ ...actionBtn, background: "#25D366" }}><Icons.WhatsApp /></button>
            <button onClick={() => cobrar(t)} style={actionBtn}>✔</button>
          </div>
        </div>
      ))}

      {/* MODAL DE NUEVO TURNO */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
               <h2 style={{ ...titleStyle, margin: 0 }}>NUEVO TURNO</h2>
               <button onClick={closeModal} style={{ background: "none", border: "none", color: theme.muted }}>X</button>
            </div>
            <label style={labelStyle}>NOMBRE DEL CLIENTE</label>
            <input style={inputStyle} placeholder="Ej: Juan Perez" value={f.nombre} onChange={e => setF({...f, nombre: e.target.value})} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>HORA</label>
                <div style={{ position: "relative" }}>
                  <div onClick={() => setIsOpenHoras(!isOpenHoras)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                    <span>{f.hora || "--:--"}</span>
                    <Icons.Chevron />
                  </div>
                  {isOpenHoras && (
                    <div style={dropdownStyle}>
                      {listaHorarios.map(h => <div key={h} onClick={() => {setF({...f, hora: h}); setIsOpenHoras(false)}} style={dropdownItem}>{h}</div>)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>BARBERO</label>
                <select style={inputStyle} value={f.barbero} onChange={e => setF({...f, barbero: e.target.value})}>
                  {barberos.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
                </select>
              </div>
            </div>

            <label style={labelStyle}>SERVICIO</label>
            <select style={inputStyle} value={f.servicio} onChange={e => setF({...f, servicio: e.target.value})}>
              {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} - {formato(s.precio)}</option>)}
            </select>

            <button onClick={handleAdd} style={btnGold}>GUARDAR TURNO</button>
          </div>
        </div>
      )}
    </>
  )
}

/* ================= STAFF CON COMISIONES ================= */
function Barberos({ sync, onUpdate }) {
  const [barberos, setBarberos] = useState(() => getLS("barberos", []))
  const [nombre, setNombre] = useState("")
  
  const handleAdd = (e) => { 
    e.preventDefault(); 
    if(!nombre) return; 
    const d = [...barberos, { nombre, id: Date.now(), comision: 50 }]; 
    setLS("barberos", d); setBarberos(d); setNombre(""); onUpdate() 
  }

  return (
    <form onSubmit={handleAdd}>
      <h2 style={titleStyle}>STAFF / BARBEROS</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Nombre del nuevo barbero..." value={nombre} onChange={e => setNombre(e.target.value)} />
        <button type="submit" style={{ ...actionBtn, width: "50px", height: "auto" }}><Icons.Plus /></button>
      </div>
      {barberos.map(b => ( 
        <div key={b.id} style={cardStyle}>
          <span style={{ fontWeight: "bold" }}>{b.nombre}</span>
          <span style={{ fontSize: "11px", color: theme.gold }}>{b.comision}% Comisión</span>
        </div> 
      ))}
    </form>
  )
}

/* ================= CAJA CON DETALLE DE BARBERO ================= */
function Caja({ sync }) {
  const total = Number(localStorage.getItem("total")) || 0
  const movs = getLS("movimientos", [])
  return (
    <div>
      <div style={cajaContainer}>
        <small style={{ color: theme.muted, letterSpacing: "2px" }}>RECAUDACIÓN TOTAL</small>
        <h2 style={{ fontSize: "40px", color: theme.gold, margin: "10px 0" }}>{formato(total)}</h2>
      </div>
      <h2 style={titleStyle}>ÚLTIMOS MOVIMIENTOS</h2>
      {movs.map((m, i) => (
        <div key={i} style={movRow}>
          <div>
            <div style={{ fontWeight: "bold" }}>{m.nombre} <small style={{ color: theme.muted }}>({m.servicio})</small></div>
            <div style={{ fontSize: "10px", color: theme.gold }}>Atendido por: {m.barbero}</div>
          </div>
          <span style={{ fontWeight: "bold" }}>{formato(m.precio)}</span>
        </div>
      ))}
    </div>
  )
}

/* ================= CONFIGURACIÓN ================= */
function ConfigDrawer({ isOpen, close, onUpdate }) {
  const [conf, setConf] = useState({
    nombreLocal: localStorage.getItem("nombreLocal") || "Mi Barbería",
    tel: localStorage.getItem("telefono") || "",
    servicios: getLS("servicios", [{ nombre: "Corte", precio: 5000 }]),
    barberos: getLS("barberos", []),
    msgPlantilla: "Hola BarberControl 💈, quiero agendar un turno para hoy a las ______. Mi nombre es ______ y busco un servicio de ______ ¿Tienen lugar? ✂️⚡"
  })

  const guardar = () => {
    localStorage.setItem("nombreLocal", conf.nombreLocal); localStorage.setItem("telefono", conf.tel)
    setLS("servicios", conf.servicios); setLS("barberos", conf.barberos); onUpdate(); close()
  }

  return (
    <>
      <div onClick={close} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", transition: "0.3s", zIndex: 90 }} />
      <div style={{ position: "fixed", top: 0, right: isOpen ? 0 : "-100%", width: "90%", maxWidth: "400px", height: "100%", background: "#111", zIndex: 100, transition: "0.4s", padding: "25px", borderLeft: `1px solid ${theme.border}`, overflowY: "auto" }}>
        <h2 style={{ color: theme.gold, fontSize: "16px", marginBottom: 20 }}>CONFIGURACIÓN PRO</h2>
        
        <label style={labelStyle}>NOMBRE DEL LOCAL</label>
        <input style={inputStyle} value={conf.nombreLocal} onChange={e => setConf({...conf, nombreLocal: e.target.value})} />

        <label style={labelStyle}>WHATSAPP DE LA BARBERÍA</label>
        <input style={inputStyle} placeholder="Ej: 54911..." value={conf.tel} onChange={e => setConf({...conf, tel: e.target.value})} />

        <label style={labelStyle}>GESTIÓN DE BARBEROS (% COMISIÓN)</label>
        {conf.barberos.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            <input style={{...inputStyle, marginBottom: 0}} value={b.nombre} readOnly />
            <input style={{...inputStyle, marginBottom: 0, width: "100px"}} type="number" value={b.comision} onChange={e => { const c = [...conf.barberos]; c[i].comision = Number(e.target.value); setConf({...conf, barberos: c}) }} />
          </div>
        ))}

        <label style={labelStyle}>SERVICIOS Y PRECIOS</label>
        {conf.servicios.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            <input style={{...inputStyle, marginBottom: 0}} value={s.nombre} onChange={e => { const c = [...conf.servicios]; c[i].nombre = e.target.value; setConf({...conf, servicios: c}) }} />
            <input style={{...inputStyle, marginBottom: 0, width: "120px"}} type="number" value={s.precio} onChange={e => { const c = [...conf.servicios]; c[i].precio = Number(e.target.value); setConf({...conf, servicios: c}) }} />
          </div>
        ))}
        <button style={btnGhost} onClick={() => setConf({...conf, servicios: [...conf.servicios, {nombre: "", precio: 0}]})}>+ AGREGAR SERVICIO</button>

        <div style={{ marginTop: 25, padding: 15, background: "#050505", borderRadius: 12 }}>
          <label style={labelStyle}>PLANTILLA PARA CLIENTES NUEVOS</label>
          <p style={{ fontSize: "10px", color: "#888", marginBottom: "10px" }}>{conf.msgPlantilla}</p>
          <button style={btnGhost} onClick={() => navigator.clipboard.writeText(conf.msgPlantilla)}><Icons.Copy /> COPIAR PLANTILLA</button>
        </div>

        <button style={{ ...btnGold, marginTop: 30 }} onClick={guardar}>GUARDAR CAMBIOS</button>
      </div>
    </>
  )
}

/* ================= ESTILOS PRO ================= */
const titleStyle = { fontSize: "11px", color: theme.muted, letterSpacing: "1.5px", fontWeight: "900", marginBottom: "15px", textTransform: "uppercase" }
const inputStyle = { width: "100%", padding: "14px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "10px", marginBottom: "12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }
const labelStyle = { display: "block", fontSize: "10px", color: theme.muted, fontWeight: "bold", marginBottom: "6px" }
const btnGold = { width: "100%", padding: "14px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "10px", cursor: "pointer" }
const btnGhost = { background: "none", border: `1px solid #333`, color: "#888", width: "100%", padding: "10px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }
const cardStyle = { background: theme.card, padding: "16px", borderRadius: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${theme.border}` }
const actionBtn = { background: theme.gold, border: "none", color: "black", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
const floatingBtn = { position: "fixed", bottom: "100px", right: "20px", width: "60px", height: "60px", borderRadius: "30px", background: theme.gold, color: "black", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.4)", zIndex: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
const cajaContainer = { background: "#000", padding: "30px 20px", borderRadius: "16px", textAlign: "center", marginBottom: "20px", border: `1px solid ${theme.border}` }
const movRow = { display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: `1px solid ${theme.border}`, fontSize: "14px" }
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }
const modalContent = { background: "#111", width: "100%", maxWidth: "450px", padding: "25px", borderRadius: "20px", border: `1px solid ${theme.border}` }
const dropdownStyle = { position: "absolute", top: "100%", left: 0, width: "100%", background: "#1A1A1A", borderRadius: "10px", zIndex: 110, maxHeight: "150px", overflowY: "auto", border: `1px solid ${theme.border}` }
const dropdownItem = { padding: "12px", borderBottom: "1px solid #222", cursor: "pointer", fontSize: "14px" }
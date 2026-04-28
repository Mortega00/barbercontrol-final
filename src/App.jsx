import { useState, useEffect } from "react"

/* ================= ICONOS SVG (MINIMALISTAS) ================= */
const Icons = {
  Agenda: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Staff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>,
  Caja: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  Config: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
}

/* ================= HELPERS ================= */
const getLS = (key, def) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch { return def; }
}
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const formato = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

const theme = { bg: "#0A0A0A", card: "#141414", gold: "#D4AF37", text: "#FFFFFF", border: "#222", muted: "#666" }

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [sync, setSync] = useState(0)

  const triggerSync = () => setSync(s => s + 1)

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER DINÁMICO */}
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>BARBERCONTROL</h1>
        <button onClick={() => setShowConfig(true)} style={{ background: "none", border: "none", color: theme.gold, cursor: "pointer" }}>
          <Icons.Config />
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ padding: "20px", paddingBottom: "110px" }}>
        {tab === "agenda" && <Agenda sync={sync} onUpdate={triggerSync} />}
        {tab === "barberos" && <Barberos sync={sync} onUpdate={triggerSync} />}
        {tab === "caja" && <Caja sync={sync} />}
      </main>

      {/* NAVEGACIÓN TIPO BOTONES FLOTANTES */}
      <nav style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.8)", backdropFilter: "blur(15px)", padding: "8px", borderRadius: "30px", display: "flex", gap: "5px", border: `1px solid ${theme.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 10 }}>
        {[
          { id: "agenda", label: "Agenda", icon: <Icons.Agenda /> },
          { id: "barberos", label: "Staff", icon: <Icons.Staff /> },
          { id: "caja", label: "Caja", icon: <Icons.Caja /> }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? theme.gold : "transparent",
            color: tab === t.id ? "black" : theme.text,
            border: "none", padding: "10px 18px", borderRadius: "25px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {t.icon} {tab === t.id && t.label.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* SIDEBAR DE CONFIGURACIÓN */}
      <ConfigDrawer isOpen={showConfig} close={() => setShowConfig(false)} onUpdate={triggerSync} />
    </div>
  )
}

/* ================= AGENDA CON SELECTOR DE HORARIOS ================= */
function Agenda({ sync, onUpdate }) {
  const [turnos, setTurnos] = useState(() => getLS("turnos", []))
  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("")
  
  const servicios = getLS("servicios", [{ nombre: "Corte", precio: 5000 }])
  const horasDisponibles = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"]

  useEffect(() => { setTurnos(getLS("turnos", [])) }, [sync])
  useEffect(() => { if(servicios.length > 0) setServicio(servicios[0].nombre) }, [])

  const agregar = () => {
    if (!nombre || !hora) return
    const nuevo = [{ id: Date.now(), nombre, hora, servicio }, ...turnos]
    setLS("turnos", nuevo); setTurnos(nuevo); setNombre(""); setHora(""); onUpdate()
  }

  const cobrar = (t) => {
    const s = servicios.find(x => x.nombre === t.servicio)
    if (!s) return
    const total = (Number(localStorage.getItem("total")) || 0) + s.precio
    const movs = getLS("movimientos", [])
    setLS("total", total); setLS("movimientos", [{ ...t, precio: s.precio }, ...movs])
    const rest = turnos.filter(x => x.id !== t.id)
    setLS("turnos", rest); setTurnos(rest); onUpdate()
  }

  return (
    <div>
      <h2 style={titleStyle}>NUEVO TURNO</h2>
      <input style={inputStyle} placeholder="Nombre del cliente" value={nombre} onChange={e => setNombre(e.target.value)} />
      
      <div style={{ marginBottom: 15 }}>
        <p style={{ fontSize: "11px", color: theme.muted, marginBottom: 8, fontWeight: "bold" }}>SELECCIONAR HORA (24HS)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {horasDisponibles.map(h => (
            <button key={h} onClick={() => setHora(h)} style={{
              padding: "10px", borderRadius: "8px", border: `1px solid ${hora === h ? theme.gold : "#222"}`,
              background: hora === h ? theme.gold : "transparent", color: hora === h ? "black" : "white", fontSize: "12px", fontWeight: "bold"
            }}>{h}</button>
          ))}
        </div>
      </div>

      <select style={inputStyle} value={servicio} onChange={e => setServicio(e.target.value)}>
        {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} - {formato(s.precio)}</option>)}
      </select>

      <button style={btnGold} onClick={agregar}>AGENDAR TURNO</button>

      <h2 style={{ ...titleStyle, marginTop: 40 }}>AGENDA DEL DÍA</h2>
      {turnos.map(t => (
        <div key={t.id} style={cardStyle}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{t.hora}hs - <span style={{ color: theme.gold }}>{t.nombre}</span></div>
            <div style={{ fontSize: "11px", color: theme.muted }}>{t.servicio.toUpperCase()}</div>
          </div>
          <button onClick={() => cobrar(t)} style={actionBtn}>✔</button>
        </div>
      ))}
    </div>
  )
}

/* ================= CAJA ================= */
function Caja({ sync }) {
  const total = Number(localStorage.getItem("total")) || 0
  const movs = getLS("movimientos", [])

  return (
    <div>
      <div style={cajaContainer}>
        <small style={{ color: theme.muted, letterSpacing: "2px" }}>RECAUDACIÓN TOTAL</small>
        <h2 style={{ fontSize: "40px", color: theme.gold, margin: "10px 0" }}>{formato(total)}</h2>
      </div>
      {movs.map((m, i) => (
        <div key={i} style={movRow}>
          <span>{m.nombre} <small style={{ color: theme.muted }}>({m.servicio})</small></span>
          <span style={{ fontWeight: "bold" }}>{formato(m.precio)}</span>
        </div>
      ))}
    </div>
  )
}

/* ================= STAFF ================= */
function Barberos({ sync, onUpdate }) {
  const [barberos, setBarberos] = useState(() => getLS("barberos", []))
  const [nombre, setNombre] = useState("")

  const agregar = () => {
    if(!nombre) return
    const data = [...barberos, { nombre, id: Date.now() }]
    setLS("barberos", data); setBarberos(data); setNombre(""); onUpdate()
  }

  return (
    <div>
      <h2 style={titleStyle}>STAFF</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Nombre barbero" value={nombre} onChange={e => setNombre(e.target.value)} />
        <button onClick={agregar} style={{ background: theme.gold, border: "none", borderRadius: "10px", padding: "0 20px", fontWeight: "bold" }}>+</button>
      </div>
      {barberos.map(b => (
        <div key={b.id} style={cardStyle}>
          <span style={{ fontWeight: "bold" }}>{b.nombre}</span>
          <button onClick={() => {
            const res = barberos.filter(x => x.id !== b.id)
            setLS("barberos", res); setBarberos(res); onUpdate()
          }} style={{ background: "none", border: "none", color: "#444" }}>Eliminar</button>
        </div>
      ))}
    </div>
  )
}

/* ================= CONFIG DRAWER (MENU LATERAL) ================= */
function ConfigDrawer({ isOpen, close, onUpdate }) {
  const [tel, setTel] = useState(localStorage.getItem("telefono") || "")
  const [servicios, setServicios] = useState(() => getLS("servicios", [{ nombre: "Corte", precio: 5000 }]))

  const guardar = () => {
    localStorage.setItem("telefono", tel)
    setLS("servicios", servicios)
    onUpdate(); close()
  }

  return (
    <>
      <div onClick={close} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", transition: "0.3s", zIndex: 90 }} />
      <div style={{ position: "fixed", top: 0, right: isOpen ? 0 : "-100%", width: "85%", maxWidth: "350px", height: "100%", background: "#111", zIndex: 100, transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)", padding: "30px", borderLeft: `1px solid ${theme.border}`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <h2 style={{ color: theme.gold, margin: 0, fontSize: "18px" }}>AJUSTES</h2>
          <button onClick={close} style={{ background: "none", border: "none", color: "white", fontSize: "20px" }}>×</button>
        </div>

        <label style={labelStyle}>WHATSAPP DE CONTACTO</label>
        <input style={inputStyle} value={tel} onChange={e => setTel(e.target.value)} placeholder="54911..." />

        <label style={labelStyle}>SERVICIOS Y PRECIOS</label>
        {servicios.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            <input style={{ ...inputStyle, marginBottom: 0 }} value={s.nombre} onChange={e => {
              const c = [...servicios]; c[i].nombre = e.target.value; setServicios(c)
            }} />
            <input style={{ ...inputStyle, marginBottom: 0, width: "100px" }} type="number" value={s.precio} onChange={e => {
              const c = [...servicios]; c[i].precio = Number(e.target.value); setServicios(c)
            }} />
          </div>
        ))}
        <button style={{ background: "none", border: `1px solid ${theme.gold}`, color: theme.gold, width: "100%", padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", marginTop: 10 }} onClick={() => setServicios([...servicios, { nombre: "", precio: 0 }])}>+ AGREGAR SERVICIO</button>

        <button style={{ ...btnGold, marginTop: 40 }} onClick={guardar}>GUARDAR CAMBIOS</button>
      </div>
    </>
  )
}

/* ================= STYLES ================= */
const titleStyle = { fontSize: "12px", color: theme.muted, letterSpacing: "2px", fontWeight: "900", marginBottom: "15px" }
const inputStyle = { width: "100%", padding: "15px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "12px", marginBottom: "15px", boxSizing: "border-box", fontSize: "14px" }
const btnGold = { width: "100%", padding: "16px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "12px", cursor: "pointer", letterSpacing: "1px" }
const cardStyle = { background: theme.card, padding: "18px", borderRadius: "16px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${theme.border}` }
const actionBtn = { background: theme.gold, border: "none", color: "black", width: "40px", height: "40px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }
const cajaContainer = { background: "linear-gradient(145deg, #141414, #000)", padding: "40px 20px", borderRadius: "20px", textAlign: "center", marginBottom: "20px", border: `1px solid ${theme.border}` }
const movRow = { display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: `1px solid ${theme.border}`, fontSize: "14px" }
const labelStyle = { display: "block", fontSize: "10px", color: theme.muted, fontWeight: "bold", marginBottom: "8px", letterSpacing: "1px" }
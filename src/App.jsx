import { useState, useEffect, useRef } from "react"

/* ================= ICONOS SVG ================= */
const Icons = {
  Agenda: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Staff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>,
  Caja: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  Config: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
}

/* ================= CONSTANTES & HELPERS ================= */
const theme = { bg: "#0A0A0A", card: "#141414", gold: "#D4AF37", text: "#FFFFFF", border: "#222", muted: "#666" }
const getLS = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def } }
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const formato = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [sync, setSync] = useState(0)
  const [barberiaNombre, setBarberiaNombre] = useState(() => localStorage.getItem("barberiaNombre") || "MI BARBERÍA")

  const triggerSync = () => {
    setSync(s => s + 1)
    setBarberiaNombre(localStorage.getItem("barberiaNombre") || "MI BARBERÍA")
  }

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "16px", fontWeight: "900", letterSpacing: "1px" }}>{barberiaNombre.toUpperCase()}</h1>
          <small style={{ color: theme.muted, fontSize: "10px" }}>CONTROL PANEL PRO</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={{ background: "none", border: "none", color: theme.gold, cursor: "pointer", padding: 10 }}>
          <Icons.Config />
        </button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "110px" }}>
        {tab === "agenda" && <Agenda sync={sync} onUpdate={triggerSync} />}
        {tab === "staff" && <Staff sync={sync} onUpdate={triggerSync} />}
        {tab === "caja" && <Caja sync={sync} onUpdate={triggerSync} />}
      </main>

      <nav style={{ position: "fixed", bottom: 25, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.9)", backdropFilter: "blur(10px)", padding: "6px", borderRadius: "40px", display: "flex", gap: "5px", border: `1px solid ${theme.border}`, zIndex: 50 }}>
        {[{ id: "agenda", label: "Agenda", icon: <Icons.Agenda /> }, { id: "staff", label: "Staff", icon: <Icons.Staff /> }, { id: "caja", label: "Caja", icon: <Icons.Caja /> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? theme.gold : "transparent", color: tab === t.id ? "black" : "white", border: "none", padding: "12px 20px", borderRadius: "30px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", transition: "0.3s"
          }}>{t.icon} {tab === t.id && t.label.toUpperCase()}</button>
        ))}
      </nav>

      <ConfigDrawer isOpen={showConfig} close={() => setShowConfig(false)} onUpdate={triggerSync} />
    </div>
  )
}

/* ================= AGENDA ================= */
function Agenda({ sync, onUpdate }) {
  const [turnos, setTurnos] = useState(() => getLS("turnos", []))
  const [f, setF] = useState({ nombre: "", hora: "10:00", servicio: "" })
  const servicios = getLS("servicios", [{ nombre: "Corte", precio: 5000 }])
  const barberos = getLS("barberos", [])

  useEffect(() => { setTurnos(getLS("turnos", [])) }, [sync])
  useEffect(() => { if(servicios.length > 0 && !f.servicio) setF(prev => ({...prev, servicio: servicios[0].nombre})) }, [servicios])

  const agregar = () => {
    if (!f.nombre) return
    const nuevo = [{ id: Date.now(), ...f }, ...turnos]
    setLS("turnos", nuevo); setTurnos(nuevo); setF({ ...f, nombre: "" }); onUpdate()
  }

  const cobrar = (t) => {
    const s = servicios.find(x => x.nombre === t.servicio)
    if (!s) return
    const total = (Number(localStorage.getItem("total")) || 0) + s.precio
    const movs = getLS("movimientos", [])
    setLS("total", total); setLS("movimientos", [{ ...t, precio: s.precio, fecha: new Date().toLocaleDateString() }, ...movs])
    const rest = turnos.filter(x => x.id !== t.id)
    setLS("turnos", rest); setTurnos(rest); onUpdate()
  }

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={labelStyle}>NUEVO TURNO</h3>
        <input style={inputStyle} placeholder="Nombre del cliente" value={f.nombre} onChange={e => setF({...f, nombre: e.target.value})} onKeyDown={e => e.key === "Enter" && agregar()} />
        <div style={{ display: "flex", gap: 10 }}>
          <input type="time" style={inputStyle} value={f.hora} onChange={e => setF({...f, hora: e.target.value})} />
          <select style={inputStyle} value={f.servicio} onChange={e => setF({...f, servicio: e.target.value})}>
            {servicios.map(s => <option key={s.nombre}>{s.nombre}</option>)}
          </select>
        </div>
        <button style={btnGold} onClick={agregar}>AGENDAR (ENTER)</button>
      </div>

      <h3 style={labelStyle}>PRÓXIMOS</h3>
      {turnos.map(t => (
        <div key={t.id} style={{ ...cardStyle, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "bold" }}>{t.hora}hs — {t.nombre}</div>
            <small style={{ color: theme.gold }}>{t.servicio}</small>
          </div>
          <button onClick={() => cobrar(t)} style={{ background: theme.gold, border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: "bold" }}>COBRAR</button>
        </div>
      ))}
    </div>
  )
}

/* ================= STAFF ================= */
function Staff({ sync }) {
  const barberos = getLS("barberos", [])
  const movs = getLS("movimientos", [])

  return (
    <div>
      <h3 style={labelStyle}>MI EQUIPO</h3>
      {barberos.length === 0 && <p style={{ color: "#444" }}>Configurá barberos en ajustes.</p>}
      {barberos.map(b => {
        const generado = movs.filter(m => m.barbero === b.nombre).reduce((acc, curr) => acc + curr.precio, 0)
        const comision = (generado * (b.comision || 0)) / 100
        return (
          <div key={b.nombre} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "800" }}>{b.nombre.toUpperCase()}</span>
              <span style={{ color: theme.gold, fontWeight: "bold" }}>{b.comision}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: "13px" }}>
              <span style={{ color: theme.muted }}>A PAGAR:</span>
              <span style={{ color: "#2ecc71", fontWeight: "bold" }}>{formato(comision)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ================= CAJA ================= */
function Caja({ sync, onUpdate }) {
  const total = Number(localStorage.getItem("total")) || 0
  const movs = getLS("movimientos", [])

  return (
    <div>
      <div style={{ textAlign: "center", padding: "40px 0", borderBottom: `1px solid ${theme.border}`, marginBottom: 20 }}>
        <small style={labelStyle}>RECAUDACIÓN DIARIA</small>
        <h2 style={{ fontSize: "48px", color: theme.gold, margin: 0 }}>{formato(total)}</h2>
      </div>
      {movs.map((m, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: `1px solid ${theme.border}`, fontSize: "14px" }}>
          <span>{m.nombre} <small style={{ color: theme.muted }}>• {m.servicio}</small></span>
          <span style={{ fontWeight: "bold" }}>{formato(m.precio)}</span>
        </div>
      ))}
      <button style={{ ...btnGold, background: "none", border: "1px solid #444", color: "#444", marginTop: 20 }} onClick={() => { if(confirm("¿Cerrar caja y borrar movimientos?")) { localStorage.setItem("total", 0); setLS("movimientos", []); onUpdate() } }}>CERRAR CAJA</button>
    </div>
  )
}

/* ================= CONFIG DRAWER ================= */
function ConfigDrawer({ isOpen, close, onUpdate }) {
  const [data, setData] = useState({
    barberiaNombre: localStorage.getItem("barberiaNombre") || "",
    telefono: localStorage.getItem("telefono") || "",
    servicios: getLS("servicios", [{ nombre: "Corte", precio: 5000 }]),
    barberos: getLS("barberos", []),
  })

  const guardar = () => {
    localStorage.setItem("barberiaNombre", data.barberiaNombre)
    localStorage.setItem("telefono", data.telefono)
    setLS("servicios", data.servicios)
    setLS("barberos", data.barberos)
    onUpdate(); alert("Configuración guardada ✂️")
  }

  const exportarBackup = () => {
    const backup = { ...localStorage }
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "barbercontrol_backup.json"; a.click()
  }

  const restaurarBackup = (e) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const obj = JSON.parse(ev.target.result)
      Object.keys(obj).forEach(k => localStorage.setItem(k, obj[k]))
      onUpdate(); alert("Copia restaurada con éxito")
    }
    reader.readAsText(e.target.files[0])
  }

  return (
    <>
      <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", transition: "0.3s", zIndex: 90, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, right: isOpen ? 0 : "-100%", width: "90%", maxWidth: "400px", height: "100%", background: "#050505", zIndex: 100, transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)", padding: "25px", borderLeft: `1px solid ${theme.border}`, overflowY: "auto" }}>
        <h2 style={{ color: theme.gold, fontSize: "18px", marginBottom: 25 }}>CONFIGURACIÓN</h2>
        
        <div style={sectionGroup}>
          <p style={labelStyle}>MI BARBERÍA</p>
          <input style={inputStyle} placeholder="Nombre del Local" value={data.barberiaNombre} onChange={e => setData({...data, barberiaNombre: e.target.value})} />
          <input style={inputStyle} placeholder="WhatsApp (Ej: 54911...)" value={data.telefono} onChange={e => setData({...data, telefono: e.target.value})} />
        </div>

        <div style={sectionGroup}>
          <p style={labelStyle}>SERVICIOS Y PRECIOS</p>
          {data.servicios.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              <input style={{ ...inputStyle, marginBottom: 0 }} value={s.nombre} onChange={e => { const c = [...data.servicios]; c[i].nombre = e.target.value; setData({...data, servicios: c}) }} />
              <input type="number" style={{ ...inputStyle, width: 80, marginBottom: 0 }} value={s.precio} onChange={e => { const c = [...data.servicios]; c[i].precio = Number(e.target.value); setData({...data, servicios: c}) }} />
              <button onClick={() => { const c = data.servicios.filter((_, idx) => idx !== i); setData({...data, servicios: c}) }} style={trashBtn}><Icons.Trash /></button>
            </div>
          ))}
          <button style={btnOutline} onClick={() => setData({...data, servicios: [...data.servicios, { nombre: "", precio: 0 }]})}>+ AGREGAR SERVICIO</button>
        </div>

        <div style={sectionGroup}>
          <p style={labelStyle}>BARBEROS Y COMISIONES</p>
          {data.barberos.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              <input style={{ ...inputStyle, marginBottom: 0 }} value={b.nombre} onChange={e => { const c = [...data.barberos]; c[i].nombre = e.target.value; setData({...data, barberos: c}) }} />
              <input type="number" placeholder="%" style={{ ...inputStyle, width: 60, marginBottom: 0 }} value={b.comision} onChange={e => { const c = [...data.barberos]; c[i].comision = Number(e.target.value); setData({...data, barberos: c}) }} />
              <button onClick={() => { const c = data.barberos.filter((_, idx) => idx !== i); setData({...data, barberos: c}) }} style={trashBtn}><Icons.Trash /></button>
            </div>
          ))}
          <button style={btnOutline} onClick={() => setData({...data, barberos: [...data.barberos, { nombre: "", comision: 50 }]})}>+ AGREGAR BARBERO</button>
        </div>

        <button style={btnGold} onClick={guardar}>GUARDAR CAMBIOS</button>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
          <button style={btnOutline} onClick={exportarBackup}>DESCARGAR BACKUP (JSON)</button>
          <label style={{ ...btnOutline, display: "block", textAlign: "center", cursor: "pointer", marginTop: 10 }}>
            RESTAURAR BACKUP <input type="file" hidden onChange={restaurarBackup} />
          </label>
          <button style={{ ...btnOutline, color: "#e74c3c", borderColor: "#e74c3c", marginTop: 30 }} onClick={() => { if(confirm("¿RESET DE FÁBRICA? Se borrará TODO.")){ localStorage.clear(); window.location.reload() } }}>RESET DE FÁBRICA</button>
          <p style={{ textAlign: "center", fontSize: "10px", color: theme.muted, marginTop: 20 }}>BarberControl PRO v1.1</p>
        </div>
      </div>
    </>
  )
}

/* ================= ESTILOS COMPARTIDOS ================= */
const cardStyle = { background: theme.card, padding: "20px", borderRadius: "18px", marginBottom: "15px", display: "flex", flexDirection: "column", border: `1px solid ${theme.border}` }
const inputStyle = { width: "100%", padding: "14px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "10px", marginBottom: "10px", boxSizing: "border-box", fontSize: "14px" }
const btnGold = { width: "100%", padding: "16px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "10px", cursor: "pointer" }
const btnOutline = { width: "100%", padding: "12px", background: "none", border: `1px solid ${theme.border}`, color: "white", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }
const labelStyle = { fontSize: "10px", color: theme.muted, fontWeight: "900", letterSpacing: "1.5px", marginBottom: "12px" }
const sectionGroup = { marginBottom: "30px" }
const trashBtn = { background: "#222", border: "none", color: "#666", padding: "0 10px", borderRadius: "8px" }
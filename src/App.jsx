import { useState, useEffect } from "react"

/* ================= HELPERS & PERSISTENCIA ================= */
const getLS = (key, def) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : def
  } catch { return def }
}
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const formato = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

/* ================= ESTILOS GLOBALES ================= */
const theme = {
  bg: "#0A0A0A",
  card: "#141414",
  gold: "#D4AF37",
  text: "#FFFFFF",
  muted: "#777",
  border: "#222"
}

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sync, setSync] = useState(0)

  const triggerSync = () => setSync(s => s + 1)

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER DINÁMICO */}
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "20px", fontWeight: "900", letterSpacing: "-1px" }}>BARBERCONTROL</h1>
          <small style={{ color: theme.muted, textTransform: "capitalize" }}>{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}</small>
        </div>
        <div onClick={() => setShowConfig(true)} style={{ 
          background: theme.gold, color: "black", borderRadius: "12px", width: 38, height: 38, 
          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", cursor: "pointer", boxShadow: `0 0 10px ${theme.gold}44`
        }}>M</div>
      </header>

      {/* VISTAS */}
      <main style={{ padding: "20px", paddingBottom: "100px" }}>
        {tab === "agenda" && <Agenda sync={sync} onUpdate={triggerSync} />}
        {tab === "barberos" && <Barberos sync={sync} />}
        {tab === "caja" && <Caja sync={sync} onUpdate={triggerSync} />}
      </main>

      {/* FAB - BOTÓN FLOTANTE */}
      {tab === "agenda" && (
        <button onClick={() => setShowAddModal(true)} style={{
          position: "fixed", bottom: 95, right: 20, width: 60, height: 60, borderRadius: "50%",
          background: theme.gold, border: "none", fontSize: "28px", fontWeight: "bold", boxShadow: "0 8px 20px rgba(0,0,0,0.5)", zIndex: 10
        }}>+</button>
      )}

      {/* NAVBAR MOBILE */}
      <nav style={{ 
        position: "fixed", bottom: 0, width: "100%", background: "#050505", 
        borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "18px 0", zIndex: 5
      }}>
        {[
          { id: "agenda", label: "Agenda", icon: "📅" },
          { id: "barberos", label: "Staff", icon: "👥" },
          { id: "caja", label: "Caja", icon: "💰" }
        ].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{ 
            textAlign: "center", color: tab === t.id ? theme.gold : "#444", cursor: "pointer" 
          }}>
            <div style={{ fontSize: "22px" }}>{t.icon}</div>
            <div style={{ fontSize: "9px", marginTop: 4, fontWeight: "800", letterSpacing: "1px" }}>{t.label.toUpperCase()}</div>
          </div>
        ))}
      </nav>

      {/* MODALES */}
      {showConfig && <ConfigModal close={() => setShowConfig(false)} onUpdate={triggerSync} />}
      {showAddModal && <AddTurnoModal close={() => setShowAddModal(false)} onAdd={triggerSync} />}
    </div>
  )
}

/* ================= AGENDA CON CRM ================= */
function Agenda({ sync, onUpdate }) {
  const [turnos, setTurnos] = useState(() => getLS("turnos", []))
  const barberos = getLS("barberos", [])
  const servicios = getLS("servicios", [])

  useEffect(() => { setTurnos(getLS("turnos", [])) }, [sync])

  const cobrar = (t) => {
    const serv = servicios.find(s => s.nombre === t.servicio)
    if (!serv) return alert("Configurá el precio primero")

    // 1. Sumar a Caja
    const totalActual = Number(localStorage.getItem("total")) || 0
    localStorage.setItem("total", totalActual + serv.precio)

    // 2. Movimiento detallado
    const movs = getLS("movimientos", [])
    setLS("movimientos", [{ ...t, precio: serv.precio, idMov: Date.now() }, ...movs])

    // 3. Comisión al Barbero
    const bDB = getLS("barberos", [])
    const bAct = bDB.map(b => {
      if (b.nombre === t.barbero) {
        const ganancia = (serv.precio * (b.comision || 50)) / 100
        return { ...b, ganado: (b.ganado || 0) + ganancia, cortes: (b.cortes || 0) + 1 }
      }
      return b
    })
    setLS("barberos", bAct)

    // 4. Limpiar Agenda
    const filtrados = turnos.filter(x => x.id !== t.id)
    setLS("turnos", filtrados); setTurnos(filtrados)
    onUpdate()
  }

  const msgWA = (t) => {
    const tel = localStorage.getItem("telefono") || ""
    const text = `Hola! 💈 Confirmamos tu turno para hoy a las ${t.hora}. ¡Te esperamos! ✨`
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`)
  }

  return (
    <div>
      <h3 style={{ fontSize: "16px", color: theme.muted, marginBottom: "15px" }}>PRÓXIMOS TURNOS</h3>
      {turnos.length === 0 && <div style={{ textAlign: "center", marginTop: 40, color: "#333" }}>📅 Agenda vacía</div>}
      {turnos.map(t => (
        <div key={t.id} style={cardStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "17px", fontWeight: "bold" }}>{t.hora}hs - <span style={{ color: theme.gold }}>{t.nombre}</span></div>
            <div style={{ fontSize: "12px", color: theme.muted, marginTop: 4 }}>{t.servicio} • {t.barbero}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => msgWA(t)} style={actionBtn}>📱</button>
            <button onClick={() => cobrar(t)} style={{...actionBtn, background: theme.gold, color: "black"}}>💰</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= STAFF & COMISIONES ================= */
function Barberos({ sync }) {
  const [barberos, setBarberos] = useState([])
  useEffect(() => { setBarberos(getLS("barberos", [])) }, [sync])

  return (
    <div>
      <h3 style={{ fontSize: "16px", color: theme.muted, marginBottom: "15px" }}>RENDIMIENTO STAFF</h3>
      {barberos.map((b, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>{b.nombre}</div>
            <div style={{ fontSize: "12px", color: theme.gold }}>{b.cortes || 0} cortes realizados</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: theme.muted }}>A PAGAR</div>
            <div style={{ fontWeight: "bold", color: "#27ae60" }}>{formato(b.ganado || 0)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= CAJA REAL ================= */
function Caja({ sync, onUpdate }) {
  const [total, setTotal] = useState(0)
  const [movs, setMovs] = useState([])

  useEffect(() => {
    setTotal(Number(localStorage.getItem("total")) || 0)
    setMovs(getLS("movimientos", []))
  }, [sync])

  const cerrarCaja = () => {
    if (confirm("¿Cerrar caja? Se descargarán los datos y se reseteará el día.")) {
      const data = { fecha: new Date(), total, movimientos: movs }
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Caja_${Date.now()}.json`; a.click()
      
      localStorage.setItem("total", 0); setLS("movimientos", [])
      // Reset de cortes y ganancias de barberos
      const bAct = getLS("barberos", []).map(b => ({ ...b, ganado: 0, cortes: 0 }))
      setLS("barberos", bAct)
      onUpdate()
    }
  }

  return (
    <div>
      <div style={{ background: "linear-gradient(145deg, #1a1a1a, #000)", padding: 30, borderRadius: 25, textAlign: "center", marginBottom: 20, border: `1px solid ${theme.gold}33` }}>
        <div style={{ color: theme.muted, fontSize: "12px", fontWeight: "bold" }}>TOTAL RECAUDADO</div>
        <h2 style={{ color: theme.gold, fontSize: "48px", margin: "10px 0" }}>{formato(total)}</h2>
        <button onClick={cerrarCaja} style={{ background: "none", border: `1px solid ${theme.muted}`, color: theme.muted, padding: "5px 15px", borderRadius: "20px", fontSize: "10px" }}>CERRAR CAJA</button>
      </div>
      {movs.map(m => (
        <div key={m.idMov} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <div style={{ fontSize: "14px" }}>{m.nombre} - <small style={{ color: theme.muted }}>{m.servicio}</small></div>
            <div style={{ fontSize: "10px", color: theme.muted }}>{m.barbero}</div>
          </div>
          <div style={{ color: theme.gold, fontWeight: "bold" }}>{formato(m.precio)}</div>
        </div>
      ))}
    </div>
  )
}

/* ================= MODALES ESTILIZADOS ================= */
function AddTurnoModal({ close, onAdd }) {
  const servicios = getLS("servicios", [{ nombre: "Corte", precio: 5000 }])
  const barberos = getLS("barberos", [{ nombre: "Maxi", comision: 50 }, { nombre: "Fede", comision: 50 }])
  const [f, setF] = useState({ nombre: "", hora: "", servicio: servicios[0]?.nombre, barbero: barberos[0]?.nombre })
  const clientes = [...new Set(getLS("movimientos", []).map(m => m.nombre))]

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3 style={{ color: theme.gold, marginTop: 0 }}>NUEVO TURNO</h3>
        <input style={inputStyle} list="clientes" placeholder="Nombre" onChange={e => setF({...f, nombre: e.target.value})} />
        <datalist id="clientes">{clientes.map(c => <option key={c} value={c} />)}</datalist>
        <input style={inputStyle} type="time" onChange={e => setF({...f, hora: e.target.value})} />
        <select style={inputStyle} onChange={e => setF({...f, servicio: e.target.value})}>
          {servicios.map(s => <option key={s.nombre}>{s.nombre} ({formato(s.precio)})</option>)}
        </select>
        <select style={inputStyle} onChange={e => setF({...f, barbero: e.target.value})}>
          {barberos.map(b => <option key={b.nombre}>{b.nombre}</option>)}
        </select>
        <button style={btnGold} onClick={() => {
          if(!f.nombre || !f.hora) return
          setLS("turnos", [{ ...f, id: Date.now() }, ...getLS("turnos", [])])
          onAdd(); close()
        }}>AGENDAR AHORA</button>
        <button style={{ background: "none", color: theme.muted, border: "none", width: "100%", marginTop: 10 }} onClick={close}>CANCELAR</button>
      </div>
    </div>
  )
}

function ConfigModal({ close, onUpdate }) {
  const [s, setS] = useState(getLS("servicios", [{ nombre: "Corte", precio: 5000 }]))
  const [b, setB] = useState(getLS("barberos", [{ nombre: "Maxi", comision: 50 }]))
  const [tel, setTel] = useState(localStorage.getItem("telefono") || "")

  const guardar = () => {
    setLS("servicios", s); setLS("barberos", b); localStorage.setItem("telefono", tel)
    onUpdate(); close()
  }

  return (
    <div style={modalOverlay}>
      <div style={{...modalContent, maxHeight: "80vh", overflowY: "auto"}}>
        <h3 style={{ color: theme.gold }}>CONFIGURACIÓN</h3>
        <small style={{ color: theme.muted }}>WhatsApp Local</small>
        <input style={inputStyle} value={tel} onChange={e => setTel(e.target.value)} placeholder="54911..." />
        
        <h4 style={{ fontSize: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: 15 }}>SERVICIOS</h4>
        {s.map((x, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
            <input style={{...inputStyle, marginBottom: 0}} value={x.nombre} onChange={e => { const n = [...s]; n[i].nombre = e.target.value; setS(n) }} />
            <input style={{...inputStyle, marginBottom: 0, width: 80}} type="number" value={x.precio} onChange={e => { const n = [...s]; n[i].precio = Number(e.target.value); setS(n) }} />
          </div>
        ))}
        <button style={btnGold} onClick={guardar}>GUARDAR TODO</button>
      </div>
    </div>
  )
}

/* ================= STYLES REUSABLES ================= */
const cardStyle = { background: theme.card, padding: "18px", borderRadius: "18px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${theme.border}` }
const actionBtn = { border: "none", background: "#222", padding: "12px", borderRadius: "12px", cursor: "pointer", fontSize: "16px" }
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }
const modalContent = { background: theme.card, padding: "25px", borderRadius: "25px", width: "85%", maxWidth: "400px", border: `1px solid ${theme.border}` }
const inputStyle = { width: "100%", padding: "14px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "12px", marginBottom: "12px", boxSizing: "border-box" }
const btnGold = { width: "100%", padding: "16px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "12px", cursor: "pointer" }
import { useState, useEffect } from "react"

/* ================= HELPERS ================= */
const getLS = (key, def) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : def
  } catch {
    return def
  }
}
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const formato = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(n)

/* ================= THEME ================= */
const theme = {
  bg: "#0A0A0A",
  card: "#141414",
  gold: "#D4AF37",
  text: "#FFFFFF",
  muted: "#555",
  border: "#222"
}

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [sync, setSync] = useState(0)

  const triggerSync = () => setSync(s => s + 1)

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "Inter" }}>
      
      {/* HEADER */}
      <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}` }}>
        <h2 style={{ color: theme.gold }}>BARBERCONTROL</h2>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: 20 }}>
        {tab === "agenda" && <Agenda sync={sync} onUpdate={triggerSync} />}
        {tab === "caja" && <Caja sync={sync} onUpdate={triggerSync} />}
        {tab === "barberos" && <Barberos />}
        {tab === "config" && <Config onUpdate={triggerSync} />}
      </div>

      {/* NAV */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: 15, borderTop: `1px solid ${theme.border}` }}>
        {["agenda", "barberos", "caja", "config"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={btnNav}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ================= CONFIG ================= */
function Config({ onUpdate }) {
  const [telefono, setTelefono] = useState(localStorage.getItem("telefono") || "")
  const [mensaje, setMensaje] = useState(localStorage.getItem("mensaje") || "Hola 💈 confirmamos tu turno")

  const [servicios, setServicios] = useState(() =>
    getLS("servicios", [
      { nombre: "Corte", precio: 5000 },
      { nombre: "Barba", precio: 3000 }
    ])
  )

  const guardar = () => {
    localStorage.setItem("telefono", telefono)
    localStorage.setItem("mensaje", mensaje)
    setLS("servicios", servicios)
    onUpdate()
    alert("Guardado")
  }

  return (
    <div>
      <h2>Configuración</h2>

      <input style={input} placeholder="WhatsApp (549...)" value={telefono} onChange={e => setTelefono(e.target.value)} />
      <textarea style={input} value={mensaje} onChange={e => setMensaje(e.target.value)} />

      <h3>Servicios</h3>

      {servicios.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10 }}>
          <input
            style={input}
            value={s.nombre}
            onChange={e => {
              const copy = [...servicios]
              copy[i].nombre = e.target.value
              setServicios(copy)
            }}
          />
          <input
            style={input}
            type="number"
            value={s.precio}
            onChange={e => {
              const copy = [...servicios]
              copy[i].precio = Number(e.target.value)
              setServicios(copy)
            }}
          />
          <button onClick={() => setServicios(servicios.filter((_, idx) => idx !== i))}>X</button>
        </div>
      ))}

      <button onClick={() => setServicios([...servicios, { nombre: "", precio: 0 }])}>Agregar</button>

      <br /><br />
      <button style={btnGold} onClick={guardar}>Guardar</button>
    </div>
  )
}

/* ================= AGENDA ================= */
function Agenda({ sync, onUpdate }) {
  const [turnos, setTurnos] = useState(getLS("turnos", []))

  const servicios = getLS("servicios", [])
  const telefono = localStorage.getItem("telefono") || ""
  const mensaje = localStorage.getItem("mensaje") || "Hola 💈 confirmamos tu turno"

  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState(servicios[0]?.nombre || "")

  useEffect(() => {
    setTurnos(getLS("turnos", []))
  }, [sync])

  const guardar = (data) => {
    setTurnos(data)
    setLS("turnos", data)
    onUpdate()
  }

  const agregar = () => {
    if (!nombre || !hora) return
    guardar([{ id: Date.now(), nombre, hora, servicio }, ...turnos])
    setNombre("")
    setHora("")
  }

  const cobrar = (t) => {
    const s = servicios.find(x => x.nombre === t.servicio)
    if (!s) return

    const total = (Number(localStorage.getItem("total")) || 0) + s.precio
    const mov = getLS("movimientos", [])

    setLS("total", total)
    setLS("movimientos", [{ ...t, precio: s.precio }, ...mov])

    guardar(turnos.filter(x => x.id !== t.id))
  }

  return (
    <div>
      <h2>Agenda</h2>

      <input style={input} placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input style={input} type="time" value={hora} onChange={e => setHora(e.target.value)} />

      <select style={input} value={servicio} onChange={e => setServicio(e.target.value)}>
        {servicios.map(s => <option key={s.nombre}>{s.nombre}</option>)}
      </select>

      <button style={btnGold} onClick={agregar}>Agregar turno</button>

      {turnos.map(t => (
        <div key={t.id} style={card}>
          {t.nombre} - {t.hora} - {t.servicio}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => {
              const msg = `${mensaje} a las ${t.hora}`
              window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(msg)}`)
            }}>WA</button>

            <button onClick={() => cobrar(t)}>✔</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= CAJA ================= */
function Caja({ sync }) {
  const [total, setTotal] = useState(0)
  const [mov, setMov] = useState([])

  useEffect(() => {
    setTotal(Number(localStorage.getItem("total")) || 0)
    setMov(getLS("movimientos", []))
  }, [sync])

  return (
    <div>
      <h2>{formato(total)}</h2>

      {mov.map((m, i) => (
        <div key={i} style={card}>
          {m.servicio} - {formato(m.precio)}
        </div>
      ))}
    </div>
  )
}

/* ================= BARBEROS ================= */
function Barberos() {
  const [barberos, setBarberos] = useState(getLS("barberos", []))
  const [nombre, setNombre] = useState("")

  const guardar = (data) => {
    setBarberos(data)
    setLS("barberos", data)
  }

  return (
    <div>
      <h2>Barberos</h2>

      <input style={input} onChange={e => setNombre(e.target.value)} />
      <button onClick={() => guardar([...barberos, { nombre }])}>Agregar</button>

      {barberos.map((b, i) => (
        <div key={i}>{b.nombre}</div>
      ))}
    </div>
  )
}

/* ================= STYLES ================= */
const input = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#000",
  color: "white"
}

const btnGold = {
  width: "100%",
  padding: 12,
  background: "#D4AF37",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
}

const btnNav = {
  background: "none",
  border: "none",
  color: "white",
  fontWeight: "bold"
}

const card = {
  background: "#141414",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  display: "flex",
  justifyContent: "space-between"
}
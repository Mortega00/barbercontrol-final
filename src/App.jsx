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
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n)

/* ================= UI BASE ================= */

const container = {
  background: "#0A0A0A",
  color: "white",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
  display: "flex",
  flexDirection: "column"
}

const content = {
  maxWidth: 500,
  margin: "0 auto",
  width: "100%",
  padding: 20
}

const card = {
  background: "#141414",
  borderRadius: 12,
  padding: 15,
  marginBottom: 12,
  border: "1px solid #222"
}

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#111",
  color: "white"
}

const button = {
  background: "#D4AF37",
  color: "black",
  border: "none",
  padding: 10,
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
}

const row = {
  display: "flex",
  gap: 10,
  marginTop: 10
}

/* ================= APP ================= */

export default function App() {
  const [tab, setTab] = useState("agenda")

  return (
    <div style={container}>
      <div style={{ ...content, paddingBottom: 80 }}>
        <h2 style={{ color: "#D4AF37" }}>BARBERCONTROL</h2>

        {tab === "agenda" && <Agenda />}
        {tab === "caja" && <Caja />}
        {tab === "barberos" && <Barberos />}
        {tab === "config" && <Config />}
      </div>

      {/* NAV */}
      <div style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: "#050505",
        borderTop: "1px solid #222",
        display: "flex",
        justifyContent: "space-around",
        padding: 10
      }}>
        {["agenda", "barberos", "caja", "config"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none",
            border: "none",
            color: tab === t ? "#D4AF37" : "#555"
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ================= CONFIG ================= */

function Config() {
  const [nombre, setNombre] = useState(localStorage.getItem("nombre") || "BarberControl")
  const [telefono, setTelefono] = useState(localStorage.getItem("telefono") || "")
  const [mensaje, setMensaje] = useState(localStorage.getItem("mensaje") || "")

  const [servicios, setServicios] = useState(() =>
    getLS("servicios", [
      { nombre: "Corte", precio: 5000 },
      { nombre: "Barba", precio: 3000 }
    ])
  )

  const guardar = () => {
    localStorage.setItem("nombre", nombre)
    localStorage.setItem("telefono", telefono)
    localStorage.setItem("mensaje", mensaje)
    setLS("servicios", servicios)
    alert("Guardado")
  }

  return (
    <div style={card}>
      <h3>Configuración</h3>

      <input style={input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre barbería" />
      <br /><br />

      <input style={input} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="WhatsApp" />
      <br /><br />

      <textarea style={input} value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Mensaje automático" />

      <br /><br />

      <button style={button} onClick={guardar}>Guardar</button>
    </div>
  )
}

/* ================= AGENDA ================= */

function Agenda() {
  const [turnos, setTurnos] = useState(getLS("turnos", []))
  const servicios = getLS("servicios", [])
  const barberos = getLS("barberos", [])

  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("")
  const [barbero, setBarbero] = useState("")

  const guardar = (data) => {
    setTurnos(data)
    setLS("turnos", data)
    window.dispatchEvent(new Event("sync"))
  }

  const agregar = () => {
    if (!nombre || !hora) return
    guardar([{ id: Date.now(), nombre, hora, servicio, barbero }, ...turnos])
  }

  return (
    <div>
      <div style={card}>
        <h3>Nuevo Turno</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input style={input} placeholder="Cliente" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input style={input} type="time" onChange={e => setHora(e.target.value)} />

          <select style={input} onChange={e => setServicio(e.target.value)}>
            {servicios.map(s => <option key={s.nombre}>{s.nombre}</option>)}
          </select>

          <select style={input} onChange={e => setBarbero(e.target.value)}>
            {barberos.map(b => <option key={b.nombre}>{b.nombre}</option>)}
          </select>
        </div>

        <button style={{ ...button, marginTop: 10, width: "100%" }} onClick={agregar}>
          Agendar turno
        </button>
      </div>

      {turnos.map(t => (
        <div key={t.id} style={card}>
          <strong>{t.nombre}</strong>
          <div style={{ color: "#777" }}>{t.hora} • {t.servicio}</div>
        </div>
      ))}
    </div>
  )
}

/* ================= CAJA ================= */

function Caja() {
  const [total, setTotal] = useState(Number(localStorage.getItem("total")) || 0)
  const [mov, setMov] = useState(getLS("movimientos", []))

  useEffect(() => {
    const sync = () => {
      setTotal(Number(localStorage.getItem("total")) || 0)
      setMov(getLS("movimientos", []))
    }
    window.addEventListener("sync", sync)
    return () => window.removeEventListener("sync", sync)
  }, [])

  return (
    <div>
      <div style={card}>
        <h2 style={{ color: "#D4AF37" }}>{formato(total)}</h2>
      </div>

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
  const [comision, setComision] = useState(50)

  const guardar = (data) => {
    setBarberos(data)
    setLS("barberos", data)
  }

  const agregar = () => {
    guardar([...barberos, { nombre, comision, ganado: 0 }])
  }

  return (
    <div>
      <div style={card}>
        <h3>Nuevo Barbero</h3>

        <input style={input} placeholder="Nombre" onChange={e => setNombre(e.target.value)} />
        <br /><br />

        <input style={input} type="number" value={comision} onChange={e => setComision(e.target.value)} />

        <button style={{ ...button, marginTop: 10 }} onClick={agregar}>
          Agregar
        </button>
      </div>

      {barberos.map((b, i) => (
        <div key={i} style={card}>
          {b.nombre} - {b.comision}%
        </div>
      ))}
    </div>
  )
}
import { useState } from "react"

function App() {
  const [tab, setTab] = useState("agenda")

  const descargarRespaldo = () => {
    const data = {
      turnos: JSON.parse(localStorage.getItem("turnos")) || [],
      movimientos: JSON.parse(localStorage.getItem("movimientos")) || [],
      barberos: JSON.parse(localStorage.getItem("barberos")) || []
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "respaldo-barbercontrol.json"
    a.click()
  }

  return (
    <div style={{
      background: "#0A0A0A",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* HEADER */}
      <div style={{
        padding: 15,
        borderBottom: "1px solid #222",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <h2 style={{ color: "#D4AF37" }}>BARBERCONTROL</h2>

        <div
          onClick={descargarRespaldo}
          style={{
            background: "#222",
            borderRadius: "50%",
            width: 35,
            height: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          M
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, padding: 20 }}>
        {tab === "agenda" && <Agenda />}
        {tab === "caja" && <Caja />}
        {tab === "barberos" && <Barberos />}
      </div>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        padding: 10,
        borderTop: "1px solid #222"
      }}>

        <button onClick={() => setTab("agenda")} style={{ color: tab === "agenda" ? "#D4AF37" : "white" }}>
          Agenda
        </button>

        <button onClick={() => setTab("barberos")} style={{ color: tab === "barberos" ? "#D4AF37" : "white" }}>
          Barberos
        </button>

        <button onClick={() => setTab("caja")} style={{ color: tab === "caja" ? "#D4AF37" : "white" }}>
          Caja
        </button>

      </div>

    </div>
  )
}

function Agenda() {
  const [turnos, setTurnos] = useState(() => {
    return JSON.parse(localStorage.getItem("turnos")) || []
  })

  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("Corte")

  const guardar = (nuevos) => {
    setTurnos(nuevos)
    localStorage.setItem("turnos", JSON.stringify(nuevos))
  }

  const agregarTurno = () => {
    if (!nombre || !hora) return

    const nuevo = {
      nombre,
      hora,
      servicio,
      estado: "ESPERANDO"
    }

    guardar([nuevo, ...turnos])
    setNombre("")
    setHora("")
  }

  const cambiarEstado = (i, estado) => {
    const nuevos = [...turnos]
    nuevos[i].estado = estado
    guardar(nuevos)
  }

  const eliminar = (i) => {
    const nuevos = turnos.filter((_, index) => index !== i)
    guardar(nuevos)
  }

  const abrirWhatsApp = (t) => {
    const mensaje = `Hola ${t.nombre} 💈, confirmamos tu turno para hoy a las ${t.hora}. ¡Te esperamos! ✨`
    const url = `https://api.whatsapp.com/send?phone=541130700900&text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
  }

  const colorEstado = (estado) => {
    if (estado === "CONFIRMADO") return "#D4AF37"
    if (estado === "EN CURSO") return "#3b82f6"
    return "#555"
  }

  return (
    <div>

      <h2>Agenda</h2>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input placeholder="Hora" value={hora} onChange={(e) => setHora(e.target.value)} style={{ marginLeft: 10 }} />

        <select value={servicio} onChange={(e) => setServicio(e.target.value)} style={{ marginLeft: 10 }}>
          <option>Corte</option>
          <option>Barba</option>
        </select>

        <button onClick={agregarTurno} style={{ marginLeft: 10 }}>
          Agregar
        </button>
      </div>

      {turnos.length === 0 && <p style={{ color: "#777" }}>No hay turnos</p>}

      {turnos.map((t, i) => (
        <div key={i} style={{ background: "#111", padding: 12, borderRadius: 10, marginBottom: 10 }}>
          <strong>{t.nombre}</strong> - {t.hora} - {t.servicio}

          <div style={{
            marginTop: 5,
            background: colorEstado(t.estado),
            padding: "3px 8px",
            borderRadius: 5,
            display: "inline-block"
          }}>
            {t.estado}
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => cambiarEstado(i, "CONFIRMADO")}>Confirmar</button>
            <button onClick={() => cambiarEstado(i, "EN CURSO")} style={{ marginLeft: 5 }}>En curso</button>
            <button onClick={() => abrirWhatsApp(t)} style={{ marginLeft: 5 }}>Notificar</button>
            <button onClick={() => eliminar(i)} style={{ marginLeft: 5 }}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Caja() {
  const [total, setTotal] = useState(() => Number(localStorage.getItem("total")) || 0)
  const [movimientos, setMovimientos] = useState(() => JSON.parse(localStorage.getItem("movimientos")) || [])

  const guardar = (t, m) => {
    setTotal(t)
    setMovimientos(m)
    localStorage.setItem("total", t)
    localStorage.setItem("movimientos", JSON.stringify(m))
  }

  const cobrar = (servicio, precio) => {
    const nuevoTotal = total + precio
    const nuevo = { servicio, precio, hora: new Date().toLocaleTimeString() }
    guardar(nuevoTotal, [nuevo, ...movimientos])
  }

  const cerrarCaja = () => {
    guardar(0, [])
  }

  return (
    <div>
      <h2>Caja</h2>

      <h3>Total: ${total}</h3>

      <button onClick={() => cobrar("Corte", 5000)}>+ Corte</button>
      <button onClick={() => cobrar("Barba", 3000)} style={{ marginLeft: 10 }}>+ Barba</button>
      <button onClick={cerrarCaja} style={{ marginLeft: 10 }}>Cerrar caja</button>

      <h4 style={{ marginTop: 20 }}>Movimientos</h4>

      {movimientos.map((m, i) => (
        <div key={i}>
          {m.servicio} - ${m.precio} - {m.hora}
        </div>
      ))}
    </div>
  )
}

function Barberos() {
  const [barberos, setBarberos] = useState(() => JSON.parse(localStorage.getItem("barberos")) || [])
  const [nombre, setNombre] = useState("")

  const guardar = (nuevos) => {
    setBarberos(nuevos)
    localStorage.setItem("barberos", JSON.stringify(nuevos))
  }

  const agregar = () => {
    if (!nombre) return
    guardar([...barberos, { nombre, servicios: 0 }])
    setNombre("")
  }

  return (
    <div>
      <h2>Barberos</h2>

      <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <button onClick={agregar} style={{ marginLeft: 10 }}>Agregar</button>

      {barberos.map((b, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          {b.nombre} - Servicios: {b.servicios}
        </div>
      ))}
    </div>
  )
}

export default App
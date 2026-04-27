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
    <div style={{ background: "#0A0A0A", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ padding: 15, borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ color: "#D4AF37" }}>BARBERCONTROL</h2>

        <div onClick={descargarRespaldo} style={{
          background: "#222",
          borderRadius: "50%",
          width: 35,
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
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
      <div style={{ display: "flex", justifyContent: "space-around", padding: 10, borderTop: "1px solid #222" }}>
        <button onClick={() => setTab("agenda")} style={{ color: tab === "agenda" ? "#D4AF37" : "white" }}>Agenda</button>
        <button onClick={() => setTab("barberos")} style={{ color: tab === "barberos" ? "#D4AF37" : "white" }}>Barberos</button>
        <button onClick={() => setTab("caja")} style={{ color: tab === "caja" ? "#D4AF37" : "white" }}>Caja</button>
      </div>

    </div>
  )
}

/* ========================= AGENDA ========================= */

function Agenda() {
  const [turnos, setTurnos] = useState(() => JSON.parse(localStorage.getItem("turnos")) || [])

  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("Corte")
  const [barbero, setBarbero] = useState("")

  const precios = { Corte: 5000, Barba: 3000 }

  const guardar = (data) => {
    setTurnos(data)
    localStorage.setItem("turnos", JSON.stringify(data))
  }

  const agregarTurno = () => {
    if (!nombre || !hora || !barbero) return

    const nuevo = {
      nombre,
      hora,
      servicio,
      barbero,
      estado: "ESPERANDO",
      cobrado: false
    }

    guardar([nuevo, ...turnos])
    setNombre("")
    setHora("")
  }

  const cobrar = (t) => {
    if (t.cobrado) return

    const precio = precios[t.servicio]

    let total = Number(localStorage.getItem("total")) || 0
    let movimientos = JSON.parse(localStorage.getItem("movimientos")) || []

    total += precio

    const nuevoMov = {
      servicio: t.servicio,
      precio,
      hora: new Date().toLocaleTimeString(),
      barbero: t.barbero
    }

    localStorage.setItem("total", total)
    localStorage.setItem("movimientos", JSON.stringify([nuevoMov, ...movimientos]))

    let barberos = JSON.parse(localStorage.getItem("barberos")) || []

    barberos = barberos.map(b => {
      if (b.nombre === t.barbero) {
        return {
          ...b,
          servicios: b.servicios + 1,
          ganado: (b.ganado || 0) + precio
        }
      }
      return b
    })

    localStorage.setItem("barberos", JSON.stringify(barberos))
  }

  const deshacer = (t) => {
    if (!t.cobrado) return

    const precio = precios[t.servicio]

    let total = Number(localStorage.getItem("total")) || 0
    let movimientos = JSON.parse(localStorage.getItem("movimientos")) || []

    total -= precio
    movimientos.shift()

    localStorage.setItem("total", total)
    localStorage.setItem("movimientos", JSON.stringify(movimientos))

    let barberos = JSON.parse(localStorage.getItem("barberos")) || []

    barberos = barberos.map(b => {
      if (b.nombre === t.barbero) {
        return {
          ...b,
          servicios: Math.max(0, b.servicios - 1),
          ganado: Math.max(0, (b.ganado || 0) - precio)
        }
      }
      return b
    })

    localStorage.setItem("barberos", JSON.stringify(barberos))
  }

  const cambiarEstado = (i, estado) => {
    const nuevos = [...turnos]

    if (estado === "EN CURSO" && !nuevos[i].cobrado) {
      cobrar(nuevos[i])
      nuevos[i].cobrado = true
    }

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

  const barberos = JSON.parse(localStorage.getItem("barberos")) || []

  return (
    <div>
      <h2>Agenda</h2>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={{ marginLeft: 10 }} />

        <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
          <option>Corte</option>
          <option>Barba</option>
        </select>

        <select value={barbero} onChange={(e) => setBarbero(e.target.value)}>
          <option value="">Barbero</option>
          {barberos.map((b, i) => <option key={i}>{b.nombre}</option>)}
        </select>

        <button onClick={agregarTurno}>Agregar</button>
      </div>

      {turnos.map((t, i) => (
        <div key={i} style={{ background: "#111", padding: 12, borderRadius: 10, marginBottom: 10 }}>
          <strong>{t.nombre}</strong> - {t.hora} - {t.servicio} - {t.barbero}

          <div style={{ marginTop: 10 }}>
            <button onClick={() => cambiarEstado(i, "CONFIRMADO")}>Confirmar</button>

            <button onClick={() => cambiarEstado(i, "EN CURSO")} style={{ marginLeft: 5 }}>
              En curso
            </button>

            <button onClick={() => abrirWhatsApp(t)} style={{ marginLeft: 5 }}>
              WhatsApp
            </button>

            <button onClick={() => eliminar(i)} style={{ marginLeft: 5 }}>
              Eliminar
            </button>

            <button onClick={() => deshacer(t)} style={{ marginLeft: 5 }}>
              Deshacer cobro
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ========================= CAJA ========================= */

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
    const nuevo = { servicio, precio, hora: new Date().toLocaleTimeString() }
    guardar(total + precio, [nuevo, ...movimientos])
  }

  const cerrarCaja = () => {
    const data = { total, movimientos }
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "cierre-caja.json"
    a.click()

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

/* ========================= BARBEROS ========================= */

function Barberos() {
  const [barberos, setBarberos] = useState(() => JSON.parse(localStorage.getItem("barberos")) || [])
  const [nombre, setNombre] = useState("")

  const guardar = (data) => {
    setBarberos(data)
    localStorage.setItem("barberos", JSON.stringify(data))
  }

  const agregar = () => {
    if (!nombre) return
    guardar([...barberos, { nombre, servicios: 0, ganado: 0 }])
    setNombre("")
  }

  return (
    <div>
      <h2>Barberos</h2>

      <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <button onClick={agregar} style={{ marginLeft: 10 }}>Agregar</button>

      {barberos.map((b, i) => (
        <div key={i} style={{ marginTop: 10, background: "#111", padding: 10, borderRadius: 10 }}>
          <strong>{b.nombre}</strong>
          <p>Servicios: {b.servicios}</p>
          <p>Total generado: ${b.ganado}</p>
        </div>
      ))}
    </div>
  )
}

export default App
import { useState } from "react"

/* ========================= ESTILOS PRO ========================= */

const styles = {
  container: {
    background: "#0A0A0A",
    color: "white",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },

  card: {
    background: "#111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    border: "1px solid #222"
  },

  input: {
    background: "#111",
    border: "1px solid #333",
    color: "white",
    padding: 10,
    borderRadius: 8
  },

  button: {
    background: "#D4AF37",
    color: "black",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
  },

  buttonGhost: {
    background: "transparent",
    border: "1px solid #333",
    color: "white",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer"
  }
}

/* ========================= APP ========================= */

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
    <div style={styles.container}>

      {/* HEADER */}
      <div style={{
        padding: 20,
        borderBottom: "1px solid #222",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ color: "#D4AF37" }}>BARBERCONTROL</h2>

        <div onClick={descargarRespaldo} style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          ⚙
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
        padding: 15,
        borderTop: "1px solid #222"
      }}>
        {["agenda", "barberos", "caja"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.buttonGhost,
              color: tab === t ? "#D4AF37" : "#777"
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
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

      {/* FORM */}
      <div style={{ ...styles.card, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input style={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="time" style={styles.input} value={hora} onChange={(e) => setHora(e.target.value)} />

        <select style={styles.input} value={servicio} onChange={(e) => setServicio(e.target.value)}>
          <option>Corte</option>
          <option>Barba</option>
        </select>

        <select style={styles.input} value={barbero} onChange={(e) => setBarbero(e.target.value)}>
          <option value="">Barbero</option>
          {barberos.map((b, i) => <option key={i}>{b.nombre}</option>)}
        </select>

        <button style={styles.button} onClick={agregarTurno}>+ Agregar</button>
      </div>

      {/* LISTA */}
      {turnos.map((t, i) => (
        <div key={i} style={styles.card}>
          <strong>{t.nombre}</strong>

          <p style={{ color: "#aaa" }}>
            {t.hora} · {t.servicio} · {t.barbero}
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button style={styles.buttonGhost} onClick={() => cobrar(t)}>Cobrar</button>
            <button style={styles.buttonGhost} onClick={() => abrirWhatsApp(t)}>WhatsApp</button>
            <button style={styles.buttonGhost} onClick={() => eliminar(i)}>Eliminar</button>
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

  return (
    <div>
      <div style={styles.card}>
        <h2>Total del día</h2>
        <h1 style={{ color: "#D4AF37" }}>${total}</h1>
      </div>

      <div style={styles.card}>
        <h3>Movimientos</h3>

        {movimientos.map((m, i) => (
          <div key={i} style={{ borderBottom: "1px solid #222", padding: 5 }}>
            {m.servicio} - ${m.precio} - {m.hora}
          </div>
        ))}
      </div>
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

      <div style={styles.card}>
        <input style={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <button style={{ ...styles.button, marginLeft: 10 }} onClick={agregar}>Agregar</button>
      </div>

      {barberos.map((b, i) => (
        <div key={i} style={styles.card}>
          <strong>{b.nombre}</strong>
          <p>Servicios: {b.servicios}</p>
          <p>Total: ${b.ganado}</p>
        </div>
      ))}
    </div>
  )
}

export default App
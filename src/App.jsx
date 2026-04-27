import { useState, useEffect } from "react"

/* ================= HELPERS ================= */

const getLS = (key, def) => JSON.parse(localStorage.getItem(key)) || def
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const formato = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n)

/* ================= APP ================= */

export default function App() {
  const [tab, setTab] = useState("agenda")

  return (
    <div style={{ background: "#0A0A0A", color: "white", minHeight: "100vh", padding: 20 }}>
      <h2 style={{ color: "#D4AF37" }}>BARBERCONTROL</h2>

      {tab === "agenda" && <Agenda />}
      {tab === "caja" && <Caja />}
      {tab === "barberos" && <Barberos />}
      {tab === "config" && <Config />}

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
        {["agenda", "barberos", "caja", "config"].map(t => (
          <button key={t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
    </div>
  )
}

/* ================= CONFIG ================= */

function Config() {
  const [nombre, setNombre] = useState(localStorage.getItem("nombre") || "BarberControl")
  const [telefono, setTelefono] = useState(localStorage.getItem("telefono") || "")
  const [mensaje, setMensaje] = useState(localStorage.getItem("mensaje") || "Hola 💈 quiero un turno")

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

  const agregarServicio = () => {
    setServicios([...servicios, { nombre: "", precio: 0 }])
  }

  const eliminarServicio = (i) => {
    if(confirm("Eliminar servicio?"))
      setServicios(servicios.filter((_, idx) => idx !== i))
  }

  const backup = () => {
    const data = {
      turnos: getLS("turnos", []),
      movimientos: getLS("movimientos", []),
      barberos: getLS("barberos", []),
      servicios,
      nombre,
      telefono
    }

    const blob = new Blob([JSON.stringify(data, null, 2)])
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "backup.json"
    a.click()
  }

  const restore = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = () => {
      const data = JSON.parse(reader.result)
      Object.keys(data).forEach(k => setLS(k, data[k]))
      window.location.reload()
    }

    reader.readAsText(file)
  }

  const reset = () => {
    if(confirm("Reset total?")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div>
      <h2>Configuración</h2>

      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
      <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="WhatsApp" />
      <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} />

      <h3>Servicios</h3>
      {servicios.map((s, i) => (
        <div key={i}>
          <input value={s.nombre} onChange={e => {
            const copy = [...servicios]
            copy[i].nombre = e.target.value
            setServicios(copy)
          }} />
          <input type="number" value={s.precio} onChange={e => {
            const copy = [...servicios]
            copy[i].precio = Number(e.target.value)
            setServicios(copy)
          }} />
          <button onClick={() => eliminarServicio(i)}>X</button>
        </div>
      ))}

      <button onClick={agregarServicio}>Agregar</button>

      <br /><br />
      <button onClick={guardar}>Guardar</button>
      <button onClick={backup}>Backup</button>
      <input type="file" onChange={restore} />
      <button onClick={reset}>Reset</button>
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

  const clientes = [...new Set(turnos.map(t => t.nombre))] // mini CRM

  const guardar = (data) => {
    setTurnos(data)
    setLS("turnos", data)
    window.dispatchEvent(new Event("sync"))
  }

  const agregar = () => {
    if (!nombre || !hora) return
    guardar([{ id: Date.now(), nombre, hora, servicio, barbero }, ...turnos])
  }

  const cobrar = (t) => {
    const s = servicios.find(x => x.nombre === t.servicio)
    if (!s) return

    let total = Number(localStorage.getItem("total")) || 0
    let mov = getLS("movimientos", [])

    total += s.precio
    mov.unshift({ ...t, precio: s.precio })

    setLS("total", total)
    setLS("movimientos", mov)

    window.dispatchEvent(new Event("sync"))
  }

  return (
    <div>
      <h2>Agenda</h2>

      <input list="clientes" value={nombre} onChange={e => setNombre(e.target.value)} />
      <datalist id="clientes">
        {clientes.map((c, i) => <option key={i} value={c} />)}
      </datalist>

      <input type="time" onChange={e => setHora(e.target.value)} />

      <select onChange={e => setServicio(e.target.value)}>
        {servicios.map(s => <option key={s.nombre}>{s.nombre}</option>)}
      </select>

      <select onChange={e => setBarbero(e.target.value)}>
        {barberos.map(b => <option key={b.nombre}>{b.nombre}</option>)}
      </select>

      <button onClick={agregar}>Agregar</button>

      {turnos.map(t => (
        <div key={t.id}>
          {t.nombre} - {t.servicio}
          <button onClick={() => cobrar(t)}>Cobrar</button>
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

  const eliminarMov = (i) => {
    const nuevo = mov.filter((_, idx) => idx !== i)
    setLS("movimientos", nuevo)
    setMov(nuevo)
  }

  return (
    <div>
      <h2>{formato(total)}</h2>

      {mov.map((m, i) => (
        <div key={i}>
          {m.servicio} - {formato(m.precio)}
          <button onClick={() => eliminarMov(i)}>X</button>
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
      <h2>Barberos</h2>

      <input onChange={e => setNombre(e.target.value)} />
      <input type="number" value={comision} onChange={e => setComision(e.target.value)} />

      <button onClick={agregar}>Agregar</button>

      {barberos.map((b, i) => (
        <div key={i}>
          {b.nombre} - {b.comision}%
        </div>
      ))}
    </div>
  )
}
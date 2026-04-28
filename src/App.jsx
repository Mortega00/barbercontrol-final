import { useState, useEffect } from "react"

/* ================= HELPERS ================= */
const getLS = (key, def) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : def
  } catch { return def }
}
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const formato = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("agenda")
  const [openConfig, setOpenConfig] = useState(false)
  const [sync, setSync] = useState(0)

  const update = () => setSync(s => s + 1)

  return (
    <div style={{ background:"#0A0A0A", color:"white", minHeight:"100vh", fontFamily:"sans-serif" }}>

      <header style={{ padding:20, display:"flex", justifyContent:"space-between" }}>
        <h2 style={{ color:"#D4AF37" }}>BARBERCONTROL</h2>
        <button onClick={()=>setOpenConfig(true)}>⚙</button>
      </header>

      <div style={{ padding:20 }}>
        {tab==="agenda" && <Agenda sync={sync} update={update} />}
        {tab==="caja" && <Caja sync={sync} update={update} />}
        {tab==="barberos" && <Barberos sync={sync} update={update} />}
      </div>

      <nav style={{ display:"flex", justifyContent:"space-around", padding:10 }}>
        {["agenda","barberos","caja"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </nav>

      {openConfig && <Config close={()=>setOpenConfig(false)} update={update} />}
    </div>
  )
}

/* ================= AGENDA ================= */
function Agenda({ sync, update }) {
  const [turnos, setTurnos] = useState(getLS("turnos", []))
  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("")

  const servicios = getLS("servicios", [
    { nombre:"Corte", precio:5000 }
  ])

  useEffect(()=>{ setTurnos(getLS("turnos", [])) },[sync])
  useEffect(()=>{ if(servicios.length) setServicio(servicios[0].nombre)},[])

  const agregar = () => {
    if(!nombre || !hora) return
    const nuevo = [{ id:Date.now(), nombre, hora, servicio }, ...turnos]
    setLS("turnos", nuevo)
    setTurnos(nuevo)
    setNombre(""); setHora("")
    update()
  }

  const cobrar = (t) => {
    const s = servicios.find(x=>x.nombre===t.servicio)
    if(!s) return

    const total = (Number(localStorage.getItem("total")) || 0) + s.precio
    const movs = getLS("movimientos", [])

    setLS("total", total)
    setLS("movimientos", [{ ...t, precio:s.precio }, ...movs])

    const rest = turnos.filter(x=>x.id!==t.id)
    setLS("turnos", rest)
    setTurnos(rest)
    update()
  }

  return (
    <div>
      <h3>Nuevo Turno</h3>

      <input placeholder="Nombre"
        value={nombre}
        onChange={e=>setNombre(e.target.value)}
        onKeyDown={e=>e.key==="Enter" && agregar()}
      />

      <input type="time"
        value={hora}
        onChange={e=>setHora(e.target.value)}
        onKeyDown={e=>e.key==="Enter" && agregar()}
      />

      <select value={servicio} onChange={e=>setServicio(e.target.value)}>
        {servicios.map(s=><option key={s.nombre}>{s.nombre}</option>)}
      </select>

      <button onClick={agregar}>Agregar</button>

      <h3>Agenda</h3>

      {turnos.map(t=>(
        <div key={t.id}>
          {t.nombre} - {t.hora} - {t.servicio}
          <button onClick={()=>cobrar(t)}>✔</button>
        </div>
      ))}
    </div>
  )
}

/* ================= CAJA ================= */
function Caja({ sync, update }) {
  const [total,setTotal] = useState(0)
  const [mov,setMov] = useState([])

  useEffect(()=>{
    setTotal(Number(localStorage.getItem("total")) || 0)
    setMov(getLS("movimientos", []))
  },[sync])

  const eliminar = (i)=>{
    const nuevo = mov.filter((_,idx)=>idx!==i)
    setLS("movimientos", nuevo)
    setMov(nuevo)
    update()
  }

  return (
    <div>
      <h2>{formato(total)}</h2>

      {mov.map((m,i)=>(
        <div key={i}>
          {m.nombre} - {formato(m.precio)}
          <button onClick={()=>eliminar(i)}>X</button>
        </div>
      ))}
    </div>
  )
}

/* ================= BARBEROS ================= */
function Barberos({ sync, update }) {
  const [barberos,setBarberos] = useState(getLS("barberos", []))
  const [nombre,setNombre] = useState("")
  const [comision,setComision] = useState(50)

  useEffect(()=>{ setBarberos(getLS("barberos", [])) },[sync])

  const agregar = ()=>{
    if(!nombre) return
    const data = [...barberos,{ nombre, comision }]
    setLS("barberos", data)
    setBarberos(data)
    setNombre("")
    update()
  }

  return (
    <div>
      <h3>Barberos</h3>

      <input placeholder="Nombre"
        value={nombre}
        onChange={e=>setNombre(e.target.value)}
        onKeyDown={e=>e.key==="Enter" && agregar()}
      />

      <input type="number"
        value={comision}
        onChange={e=>setComision(e.target.value)}
      />

      <button onClick={agregar}>Agregar</button>

      {barberos.map((b,i)=>(
        <div key={i}>{b.nombre} - {b.comision}%</div>
      ))}
    </div>
  )
}

/* ================= CONFIG ================= */
function Config({ close, update }) {
  const [nombre,setNombre] = useState(localStorage.getItem("nombre") || "")
  const [telefono,setTelefono] = useState(localStorage.getItem("telefono") || "")
  const [mensaje,setMensaje] = useState(localStorage.getItem("mensaje") || "")

  const [servicios,setServicios] = useState(getLS("servicios", [
    { nombre:"Corte", precio:5000 },
    { nombre:"Barba", precio:3000 }
  ]))

  const guardar = ()=>{
    localStorage.setItem("nombre",nombre)
    localStorage.setItem("telefono",telefono)
    localStorage.setItem("mensaje",mensaje)
    setLS("servicios",servicios)
    update()
    close()
  }

  const backup = ()=>{
    const data = localStorage
    const blob = new Blob([JSON.stringify(data)])
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `backup-${new Date().toLocaleDateString()}.json`
    a.click()
  }

  return (
    <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"#000" }}>
      <div style={{ padding:20 }}>
        <h3>Configuración</h3>

        <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre barbería" />
        <input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="WhatsApp" />
        <textarea value={mensaje} onChange={e=>setMensaje(e.target.value)} />

        <h4>Servicios</h4>
        {servicios.map((s,i)=>(
          <div key={i}>
            <input value={s.nombre} onChange={e=>{
              const c=[...servicios]; c[i].nombre=e.target.value; setServicios(c)
            }} />
            <input type="number" value={s.precio} onChange={e=>{
              const c=[...servicios]; c[i].precio=Number(e.target.value); setServicios(c)
            }} />
          </div>
        ))}

        <button onClick={()=>setServicios([...servicios,{ nombre:"", precio:0 }])}>+</button>

        <br/><br/>
        <button onClick={guardar}>Guardar</button>
        <button onClick={backup}>Backup</button>
        <button onClick={close}>Cerrar</button>
      </div>
    </div>
  )
}
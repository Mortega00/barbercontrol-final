import { useState, useEffect } from "react"

function App() {
  const [turnos, setTurnos] = useState([])
  const [nombre, setNombre] = useState("")
  const [hora, setHora] = useState("")
  const [servicio, setServicio] = useState("Corte")

  // Cargar turnos guardados
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("turnos")) || []
    setTurnos(guardados)
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("turnos", JSON.stringify(turnos))
  }, [turnos])

  const agregarTurno = () => {
    if (!nombre || !hora) return alert("Completá los datos")

    const nuevo = {
      nombre,
      hora,
      servicio,
      estado: "ESPERANDO"
    }

    setTurnos([nuevo, ...turnos])
    setNombre("")
    setHora("")
  }

  const cambiarEstado = (index, nuevoEstado) => {
    const nuevos = [...turnos]
    nuevos[index].estado = nuevoEstado
    setTurnos(nuevos)
  }

  const eliminarTurno = (index) => {
    const nuevos = turnos.filter((_, i) => i !== index)
    setTurnos(nuevos)
  }

  const abrirWhatsApp = () => {
    window.open(
      "https://wa.me/54911XXXXXXXX?text=Hola%20*Barbería*%20👋%2C%20quiero%20confirmar%20tu%20turno%20para%20hoy.%20¡Te%20esperamos!%20💈",
      "_blank"
    )
  }

  const colorEstado = (estado) => {
    if (estado === "CONFIRMADO") return "#D4AF37"
    if (estado === "EN CURSO") return "#3b82f6"
    return "#555"
  }

  return (
    <div style={{ padding: 20, background: "#0A0A0A", color: "white", minHeight: "100vh" }}>
      
      <h1>💈 BarberControl</h1>

      {/* FORMULARIO */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="Hora"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <select
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option>Corte</option>
          <option>Barba</option>
        </select>

        <button onClick={agregarTurno} style={{ marginLeft: 10 }}>
          Agregar
        </button>
      </div>

      {/* LISTA */}
      {turnos.map((t, i) => (
        <div key={i} style={{ borderBottom: "1px solid #333", padding: 10 }}>
          <strong>{t.nombre}</strong> - {t.hora} - {t.servicio}
          
          <div style={{ marginTop: 5 }}>
            <span style={{
              background: colorEstado(t.estado),
              padding: "3px 8px",
              borderRadius: 5
            }}>
              {t.estado}
            </span>
          </div>

          <div style={{ marginTop: 5 }}>
            <button onClick={() => cambiarEstado(i, "CONFIRMADO")}>
              Confirmar
            </button>

            <button onClick={() => cambiarEstado(i, "EN CURSO")} style={{ marginLeft: 5 }}>
              En curso
            </button>

            <button onClick={abrirWhatsApp} style={{ marginLeft: 5 }}>
              WhatsApp
            </button>

            <button onClick={() => eliminarTurno(i)} style={{ marginLeft: 5 }}>
              ❌
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
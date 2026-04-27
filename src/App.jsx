import { useState } from "react"

function App() {
  const [total, setTotal] = useState(0)
  const [movimientos, setMovimientos] = useState([])
  const [barbero, setBarbero] = useState("Fede")

  const comision = 50 // %

  const cobrar = (servicio, precio) => {
    const gananciaBarbero = (precio * comision) / 100
    const gananciaLocal = precio - gananciaBarbero

    setTotal(total + gananciaLocal)

    const nuevo = {
      servicio,
      precio,
      barbero,
      gananciaBarbero,
      gananciaLocal,
      hora: new Date().toLocaleTimeString()
    }

    setMovimientos([nuevo, ...movimientos])
  }

  const eliminarMovimiento = (index) => {
    const mov = movimientos[index]
    setTotal(total - mov.gananciaLocal)

    const nuevos = movimientos.filter((_, i) => i !== index)
    setMovimientos(nuevos)
  }

  const cerrarCaja = () => {
    if (movimientos.length === 0) {
      alert("No hay movimientos para cerrar.")
      return
    }

    const resumen = {
      totalLocal: total,
      totalServicios: movimientos.length,
      movimientos,
      fecha: new Date().toLocaleDateString()
    }

    // DESCARGA JSON
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(resumen, null, 2))

    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute(
      "download",
      "cierre_caja_" + resumen.fecha + ".json"
    )
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    alert("✅ Caja cerrada y respaldo descargado")

    // LIMPIAR
    setTotal(0)
    setMovimientos([])
  }

  return (
    <div style={{ padding: 20, background: "#0A0A0A", color: "white", minHeight: "100vh" }}>
      
      <h1>💈 BarberControl</h1>

      <h2>Total del local: ${total}</h2>

      {/* Selector de barbero */}
      <div style={{ marginBottom: 10 }}>
        <label>Barbero: </label>
        <select value={barbero} onChange={(e) => setBarbero(e.target.value)}>
          <option>Fede</option>
          <option>Juan</option>
          <option>Lucas</option>
        </select>
      </div>

      <button onClick={() => cobrar("Corte", 5000)}>
        + Corte ($5000)
      </button>

      <button onClick={() => cobrar("Barba", 3000)} style={{ marginLeft: 10 }}>
        + Barba ($3000)
      </button>

      <button 
        onClick={cerrarCaja} 
        style={{ marginLeft: 10, background: "#D4AF37", color: "black" }}
      >
        🔒 Cerrar Caja
      </button>

      <h3 style={{ marginTop: 20 }}>Movimientos</h3>

      {movimientos.map((m, i) => (
        <div key={i} style={{ borderBottom: "1px solid #333", padding: 10 }}>
          <strong>{m.barbero}</strong> - {m.servicio} - ${m.precio}  
          <br />
          💰 Barbero: ${m.gananciaBarbero} | Local: ${m.gananciaLocal}  
          <br />
          🕐 {m.hora}

          <button onClick={() => eliminarMovimiento(i)} style={{ marginLeft: 10 }}>
            ❌
          </button>
        </div>
      ))}
    </div>
  )
}

export default App
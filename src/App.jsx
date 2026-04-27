import { useState } from "react"

function App() {
  const [total, setTotal] = useState(0)
  const [movimientos, setMovimientos] = useState([])

  const cobrar = (servicio, precio) => {
    setTotal(total + precio)

    const nuevo = {
      servicio,
      precio,
      hora: new Date().toLocaleTimeString()
    }

    setMovimientos([nuevo, ...movimientos])
  }

  const eliminarMovimiento = (index) => {
    const mov = movimientos[index]
    setTotal(total - mov.precio)

    const nuevos = movimientos.filter((_, i) => i !== index)
    setMovimientos(nuevos)
  }

  return (
    <div style={{ padding: 20, background: "#0A0A0A", color: "white", minHeight: "100vh" }}>
      
      <h1>💈 BarberControl</h1>

      <h2>Total: ${total}</h2>

      <button onClick={() => cobrar("Corte", 5000)}>
        + Corte ($5000)
      </button>

      <button onClick={() => cobrar("Barba", 3000)} style={{ marginLeft: 10 }}>
        + Barba ($3000)
      </button>

      <h3 style={{ marginTop: 20 }}>Movimientos</h3>

      {movimientos.map((m, i) => (
        <div key={i} style={{ borderBottom: "1px solid #333", padding: 10 }}>
          {m.servicio} - ${m.precio} - {m.hora}
          <button onClick={() => eliminarMovimiento(i)} style={{ marginLeft: 10 }}>
            ❌
          </button>
        </div>
      ))}
    </div>
  )
}

export default App
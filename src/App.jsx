import { useState } from "react"

function App() {
  const [tab, setTab] = useState("agenda")

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
        <div style={{
          background: "#222",
          borderRadius: "50%",
          width: 35,
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
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
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        padding: 10,
        borderTop: "1px solid #222"
      }}>
        <button onClick={() => setTab("agenda")}>📅</button>
        <button onClick={() => setTab("barberos")}>👥</button>
        <button onClick={() => setTab("caja")}>💰</button>
      </div>

    </div>
  )
}
function Agenda() {
  return (
    <div>
      <h2>Lunes 27 de Abril</h2>

      {/* CARDS */}
      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        
        <Card titulo="TOTAL" valor="0" />
        <Card titulo="EN CURSO" valor="0" />
        <Card titulo="PENDIENTES" valor="0" />

      </div>

      {/* VACÍO */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <div style={{
          background: "#111",
          borderRadius: "50%",
          width: 80,
          height: 80,
          margin: "auto"
        }} />

        <p style={{ marginTop: 15 }}>No hay turnos para hoy</p>
        <p style={{ color: "#D4AF37" }}>Agregá tu primer turno</p>
      </div>
    </div>
  )
}
function Card({ titulo, valor }) {
  return (
    <div style={{
      flex: 1,
      background: "#111",
      padding: 15,
      borderRadius: 10,
      textAlign: "center"
    }}>
      <h3 style={{ color: "#D4AF37" }}>{valor}</h3>
      <p>{titulo}</p>
    </div>
  )
}
function Caja() {
  return <h2>💰 Caja</h2>
}

function Barberos() {
  return <h2>👥 Barberos</h2>
}
export default App

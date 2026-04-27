function App() {
  return (
    <div style={{padding: "20px", color: "white", background: "#0A0A0A", minHeight: "100vh"}}>
      <h1>💈 BarberControl</h1>
      <p>Sistema de gestión para barberías</p>

      <button onClick={() => alert("Cobro registrado")}>
        Cobrar servicio
      </button>
    </div>
  )
}

export default App
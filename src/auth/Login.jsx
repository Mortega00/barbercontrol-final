import { useState } from "react"
import { supabase } from "../lib/supabase"

const theme = { bg: "#000000", card: "#121212", gold: "#D4AF37", text: "#FFFFFF", border: "#1F1F1F", muted: "#8E8E93" }

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // Nueva variable
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    // Cambiamos a login tradicional para evitar el rate limit de emails
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg("❌ Error: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={logoStyle}>BARBERCONTROL</h1>
        <p style={{ color: theme.muted, fontSize: "12px" }}>ACCESO QA / PRO</p>
      </header>

      <main style={mainStyle}>
        <div style={cardStyle}>
          <h3 style={titleStyle}>Ingresar</h3>
          <form onSubmit={handleLogin}>
            <label style={labelStyle}>EMAIL</label>
            <input 
              style={inputStyle} 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            
            <label style={labelStyle}>CONTRASEÑA</label>
            <input 
              style={inputStyle} 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />

            {errorMsg && <p style={{ color: "red", fontSize: "12px", textAlign: "center" }}>{errorMsg}</p>}

            <button type="submit" style={btnGold} disabled={loading}>
              {loading ? "AUTENTICANDO..." : "ENTRAR"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

// ... (mantené los mismos estilos de antes para que se vea negro y dorado)
const containerStyle = { background: theme.bg, color: theme.text, minHeight: "100vh", display: "flex", flexDirection: "column" }
const headerStyle = { padding: "30px 20px", borderBottom: `1px solid ${theme.border}` }
const logoStyle = { color: theme.gold, margin: 0, fontSize: "22px", fontWeight: "900" }
const mainStyle = { padding: "20px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }
const cardStyle = { background: theme.card, width: "100%", maxWidth: "400px", padding: "30px", borderRadius: "30px", border: `1px solid ${theme.border}` }
const titleStyle = { color: theme.gold, marginBottom: "20px", textTransform: "uppercase" }
const inputStyle = { width: "100%", padding: "14px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "12px", marginBottom: "15px" }
const labelStyle = { display: "block", fontSize: "10px", color: theme.muted, marginBottom: "5px" }
const btnGold = { width: "100%", padding: "16px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "12px", cursor: "pointer" }
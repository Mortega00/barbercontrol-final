import { useState } from "react"
import { supabase } from "../lib/supabase"

/* ================= THEME & ICONS ================= */
const theme = { bg: "#000000", card: "#121212", gold: "#D4AF37", text: "#FFFFFF", border: "#1F1F1F", muted: "#8E8E93" }

const Icons = {
  Chevron: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
}

/* ================= PANTALLA: LOGIN PRO ================= */
export default function Login() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("") // Para feedback de UX

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // QA Tip: signInWithOtp manda Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin, // Para volver a la app despues del click
      }
    })

    if (error) {
      console.error("Error Auth:", error.message)
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage("🚀 ¡Revisá tu email! Te enviamos un link de acceso.")
    }

    setLoading(false)
  }

  return (
    <div style={containerStyle}>
      
      {/* HEADER TIPO NABI */}
      <header style={headerStyle}>
        <div>
          <h1 style={logoStyle}>BARBERCONTROL</h1>
          <p style={{ color: theme.muted, fontSize: "12px", marginTop: "4px" }}>GESTIÓN PROFESIONAL</p>
        </div>
      </header>

      {/* CUERPO DEL LOGIN */}
      <main style={mainStyle}>
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
             <h3 style={titleStyle}>INGRESAR A TU CUENTA</h3>
          </div>
          
          <form onSubmit={handleLogin}>
            <label style={labelStyle}>EMAIL DE ACCESO</label>
            <input 
              style={inputStyle} 
              type="email"
              placeholder="tu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
            
            {/* Feedback de UX */}
            {message && (
                <p style={{ fontSize: "12px", color: message.includes('❌') ? "#ff4444" : theme.gold, textAlign: "center", marginBottom: "15px" }}>
                    {message}
                </p>
            )}

            <button type="submit" style={btnGold} disabled={loading}>
              {loading ? (
                <div style={spinnerContainer}>
                  <div style={spinnerStyle}></div>
                  ENVIANDO LINK...
                </div>
              ) : (
                <>ENTRAR CON MAGIC LINK <Icons.Chevron /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#333", fontSize: "10px", marginTop: "30px" }}>
              ¿Sos barbero? Pedile el PIN a tu dueño.
          </p>
        </div>
      </main>

      <p style={footerStyle}>BarberControl PRO v1.6</p>
    </div>
  )
}

/* ================= ESTILOS PRO (v1.5 Compatible) ================= */
const containerStyle = { background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }
const headerStyle = { padding: "30px 20px 10px 20px", borderBottom: `1px solid ${theme.border}` }
const logoStyle = { color: theme.gold, margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px" }
const mainStyle = { padding: "20px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }
const cardStyle = { background: theme.card, width: "100%", maxWidth: "450px", padding: "30px", borderRadius: "30px", border: `1px solid ${theme.border}`, boxShadow: "0 15px 40px rgba(0,0,0,0.4)" }
const titleStyle = { margin: 0, fontSize: "18px", fontWeight: "900", color: theme.gold, textTransform: "uppercase", letterSpacing: "1px" }
const inputStyle = { width: "100%", padding: "16px", background: "#000", border: `1px solid ${theme.border}`, color: "white", borderRadius: "14px", marginBottom: "20px", boxSizing: "border-box", fontSize: "14px", outline: "none" }
const labelStyle = { display: "block", fontSize: "10px", color: theme.muted, fontWeight: "800", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }
const btnGold = { width: "100%", padding: "16px", background: theme.gold, color: "black", fontWeight: "900", border: "none", borderRadius: "16px", cursor: "pointer", fontSize: "14px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "0.2s" }
const footerStyle = { textAlign: "center", color: "#111", fontSize: "10px", padding: "20px" }

// Spinner básico para el loading
const spinnerContainer = { display: "flex", alignItems: "center", gap: "8px" }
const spinnerStyle = { width: "12px", height: "12px", border: "2px solid #000", borderTop: "2px solid rgba(0,0,0,0.1)", borderRadius: "50%", animation: "spin 1s linear infinite" }
// Agregar esto al index.css o crear un tag style: @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
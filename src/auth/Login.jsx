import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email
    })
    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Revisá tu email para ingresar 🚀")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Ingresar a BarberControl</h2>
      <input
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Enviando..." : "Entrar"}
      </button>
    </div>
  )
}
import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

/* ================= CONFIGURACIÓN VISUAL (EL FIX DEL TEMA) ================= */
const theme = { 
  bg: "#000000", 
  card: "#121212", 
  gold: "#D4AF37", 
  text: "#FFFFFF", 
  border: "#1F1F1F", 
  muted: "#8E8E93" 
};

const Icons = {
  Config: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Cash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
};

/* ================= HELPERS DE SUPABASE ================= */

const getMyBarbershop = async (user) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("barbershop_id")
    .eq("id", user.id)
    .single()

  if (error) {
    console.log("Aún no tiene perfil/barbería:", error.message)
    return null
  }
  return data.barbershop_id
}

const createBarbershopForUser = async (user) => {
  const { data: shop, error: shopError } = await supabase
    .from("barbershops")
    .insert([{ name: "Mi Nueva Barbería" }])
    .select()
    .single()

  if (shopError) return null

  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: user.id, barbershop_id: shop.id }])

  if (profileError) return null
  return shop.id
}

/* ================= COMPONENTE PRINCIPAL ================= */

export default function App() {
  const [session, setSession] = useState(null)
  const [userShopId, setUserShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setUserShopId(null)
        setLoading(false)
      }
    })

    return () => { listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const fetchUserShop = async () => {
      if (session?.user) {
        setLoading(true)
        const id = await getMyBarbershop(session.user)
        if (id) {
          setUserShopId(id)
        } else {
          const newShopId = await createBarbershopForUser(session.user)
          setUserShopId(newShopId)
        }
        setLoading(false)
      }
    }
    fetchUserShop()
  }, [session])

  if (loading) return <div style={loadingStyle}>BARBERCONTROL PRO...</div>
  if (!session) return <Login />

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
          <small style={{ color: "#333", fontSize: "9px" }}>ID SHOP: {userShopId?.split('-')[0]}...</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={{ background: "none", border: "none", color: theme.gold, cursor: "pointer" }}>
          <Icons.Config />
        </button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "110px" }}>
        <h2 style={{ color: theme.text }}>Bienvenido al Panel</h2>
        <p style={{ color: theme.muted }}>Tu sistema está listo. Selecciona una opción abajo.</p>
        {/* Aquí irán tus componentes Agenda, Barberos y Caja próximamente */}
      </main>

      {/* NAV INFERIOR TIPO NABI */}
      <nav style={navStyle}>
        <button onClick={() => setTab("agenda")} style={tab === "agenda" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Calendar /> <span style={{fontSize: '10px'}}>AGENDA</span>
        </button>
        <button onClick={() => setTab("barberos")} style={tab === "barberos" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Users /> <span style={{fontSize: '10px'}}>BARBEROS</span>
        </button>
        <button onClick={() => setTab("caja")} style={tab === "caja" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Cash /> <span style={{fontSize: '10px'}}>CAJA</span>
        </button>
      </nav>
    </div>
  )
}

/* ================= ESTILOS COMPLEMENTARIOS ================= */
const loadingStyle = { background: "#0A0A0A", color: "#D4AF37", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", fontSize: "12px", letterSpacing: "2px" }
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "80px", background: "#0A0A0A", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: `1px solid ${theme.border}`, paddingBottom: "10px" }
const activeTabStyle = { background: "none", border: "none", color: theme.gold, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", fontWeight: "900", cursor: "pointer" }
const inactiveTabStyle = { background: "none", border: "none", color: theme.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer" }
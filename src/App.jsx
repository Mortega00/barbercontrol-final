import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

// 1. EL THEME ARRIBA DE TODO (Fix: ReferenceError)
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

/* ================= HELPERS DE SUPABASE (NIVEL NEGOCIO) ================= */

const getMyBarbershop = async (user) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", user.id)
      .maybeSingle(); // Fix: Error 406 (evita explotar si no hay perfil)

    if (error) return null;
    return data?.barbershop_id || null;
  } catch (e) {
    return null;
  }
}

const createBarbershopForUser = async (user) => {
  try {
    // 1. Crear barbería
    const { data: shop, error: shopError } = await supabase
      .from("barbershops")
      .insert([{ name: "Mi Nueva Barbería" }])
      .select()
      .maybeSingle();

    if (shopError) {
      console.error("Error creando barbería (RLS?):", shopError);
      return null;
    }

    // 2. Crear perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: user.id, barbershop_id: shop.id }]);

    if (profileError) return null;
    return shop.id;
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(null)
  const [userShopId, setUserShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("agenda")

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

  if (loading) return <div style={loadingStyle}>CARGANDO BARBERCONTROL...</div>
  if (!session) return <Login />

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
        <button style={{ background: "none", border: "none", color: theme.gold }}><Icons.Config /></button>
      </header>

      <main style={{ padding: "20px" }}>
        <h2 style={{ color: theme.text }}>¡Hola! Ya estás adentro.</h2>
        <p style={{ color: theme.muted }}>El diseño Nabi Style está activo y conectado.</p>
        <div style={{ padding: "15px", background: theme.card, borderRadius: "8px", border: `1px solid ${theme.border}`, marginTop: "20px" }}>
          <small style={{ color: theme.gold }}>SHOP ID: {userShopId || "Creando..."}</small>
        </div>
      </main>

      <nav style={navStyle}>
        <button onClick={() => setTab("agenda")} style={tab === "agenda" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Calendar />
        </button>
        <button onClick={() => setTab("barberos")} style={tab === "barberos" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Users />
        </button>
        <button onClick={() => setTab("caja")} style={tab === "caja" ? activeTabStyle : inactiveTabStyle}>
          <Icons.Cash />
        </button>
      </nav>
    </div>
  )
}

// Estilos Extra
const loadingStyle = { background: "#000", color: "#D4AF37", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", fontSize: "14px", letterSpacing: "2px" };
const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, height: "75px", background: "#0A0A0A", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: "1px solid #1F1F1F", paddingBottom: "10px" };
const activeTabStyle = { background: "none", border: "none", color: "#D4AF37", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" };
const inactiveTabStyle = { background: "none", border: "none", color: "#8E8E93", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" };
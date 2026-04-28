import { useState, useEffect, useRef } from "react"
import { supabase } from "./lib/supabase"
import Login from "./auth/Login"

/* ================= HELPERS DE SUPABASE (NIVEL NEGOCIO) ================= */

// Busca si el usuario ya tiene una barbería asignada en la tabla 'profiles'
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

// Crea una barbería nueva y la vincula al perfil del usuario
const createBarbershopForUser = async (user) => {
  // 1. Crear la barbería con un nombre genérico
  const { data: shop, error: shopError } = await supabase
    .from("barbershops")
    .insert([{ name: "Mi Nueva Barbería" }])
    .select()
    .single()

  if (shopError) {
    console.error("Error creando barbería:", shopError)
    return null
  }

  // 2. Crear el perfil vinculando UserID con ShopID
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: user.id, barbershop_id: shop.id }])

  if (profileError) {
    console.error("Error creando perfil:", profileError)
    return null
  }

  return shop.id
}

/* ... (Tus otros iconos y helpers se mantienen igual) ... */

export default function App() {
  const [session, setSession] = useState(null)
  // --- NUEVOS ESTADOS ---
  const [userShopId, setUserShopId] = useState(null)
  const [loading, setLoading] = useState(true) // Para que no parpadee al cargar
  // ----------------------

  useEffect(() => {
    // 1. Escuchar sesión
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false) // Si no hay sesión, dejamos de cargar para mostrar Login
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

  // --- EFECTO PARA CARGAR EL BARBERSHOP_ID ---
  useEffect(() => {
    const fetchUserShop = async () => {
      if (session?.user) {
        setLoading(true)
        const id = await getMyBarbershop(session.user)
        
        if (id) {
          setUserShopId(id)
        } else {
          // Si es un registro nuevo, creamos su espacio de trabajo
          const newShopId = await createBarbershopForUser(session.user)
          setUserShopId(newShopId)
        }
        setLoading(false)
      }
    }

    fetchUserShop()
  }, [session])
  // -------------------------------------------

  const [tab, setTab] = useState("agenda")
  const [showConfig, setShowConfig] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sync, setSync] = useState(0)

  const triggerSync = () => setSync(s => s + 1)
  
  // Manejo de estados de carga y Auth
  if (loading) return <div style={loadingStyle}>BARBERCONTROL PRO...</div>
  if (!session) return <Login />

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h1 style={{ color: theme.gold, margin: 0, fontSize: "18px", fontWeight: "900" }}>BARBERCONTROL</h1>
          {/* Tip de QA: Mostrar el ID de barbería (solo para desarrollo) ayuda a validar el RLS */}
          <small style={{ color: "#333", fontSize: "9px" }}>ID: {userShopId?.split('-')[0]}...</small>
        </div>
        <button onClick={() => setShowConfig(true)} style={{ background: "none", border: "none", color: theme.gold, cursor: "pointer" }}><Icons.Config /></button>
      </header>

      <main style={{ padding: "20px", paddingBottom: "110px" }}>
        {/* Pasamos el userShopId a los componentes para que sepan de qué barbería traer datos */}
        {tab === "agenda" && <Agenda userShopId={userShopId} sync={sync} onUpdate={triggerSync} showModal={showAddModal} closeModal={() => setShowAddModal(false)} />}
        {tab === "barberos" && <Barberos userShopId={userShopId} sync={sync} onUpdate={triggerSync} />}
        {tab === "caja" && <Caja userShopId={userShopId} sync={sync} />}
      </main>

      {/* ... Resto de tu navegación inferior y ConfigDrawer se mantienen igual ... */}
      
      {/* Tip: Agregamos botón de Logout en el ConfigDrawer o donde prefieras */}
      <ConfigDrawer isOpen={showConfig} close={() => setShowConfig(false)} onUpdate={triggerSync} />
    </div>
  )
}

const loadingStyle = { background: "#0A0A0A", color: "#D4AF37", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", fontSize: "12px", letterSpacing: "2px" }
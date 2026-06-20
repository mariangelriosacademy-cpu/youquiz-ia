"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard, Sparkles, ClipboardList, User, LogOut,
  Menu, X, ChevronRight, Sun, Moon
} from "lucide-react";
import { ThemeProvider, useTheme } from "./theme-context";

const NAV = [
  { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Panel principal" },
  { href: "/dashboard/generar", icon: <Sparkles size={18} />, label: "Generar examen" },
  { href: "/dashboard/mis-examenes", icon: <ClipboardList size={18} />, label: "Mis exámenes" },
  { href: "/dashboard/perfil", icon: <User size={18} />, label: "Mi perfil" },
];

const Logo = () => (
  <img src="/logo.png" alt="YouQuiz IA" className="h-auto w-auto" style={{width: "250px"}} />
);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { dark, toggleDark } = useTheme();
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: perfil } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setUsuario(perfil);
    }
    cargar();
  }, []);

  async function cerrarSesion() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  }

  const bg = dark ? "bg-[#0F0F1A]" : "bg-slate-100";
  const sidebarBg = dark ? "bg-[#0a0a14] border-white/10" : "bg-white border-slate-200";
  const borderC = dark ? "border-white/10" : "border-slate-200";
  const navActivo = "bg-violet-600 text-white";
  const navInactivo = dark
    ? "text-slate-400 hover:bg-white/5 hover:text-white"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const textoNombre = dark ? "text-white" : "text-slate-800";
  const textoEmail = dark ? "text-slate-500" : "text-slate-400";
  const mobileBg = dark ? "bg-[#0F0F1A]" : "bg-white";
  const toggleBtn = dark
    ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
    : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100";

  return (
    <div className={`min-h-screen ${bg} flex transition-colors duration-200`}>

      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex w-64 flex-col border-r ${sidebarBg} fixed h-full z-20 transition-colors duration-200`}>
        <div className={`p-5 border-b ${borderC} flex items-center justify-between`}>
          <Logo />
          <button onClick={toggleDark} className={`p-1.5 rounded-lg border transition ${toggleBtn}`}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activo ? navActivo : navInactivo}`}>
                {item.icon}
                {item.label}
                {activo && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t ${borderC}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
              {usuario?.avatar_url
                ? <img src={usuario.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${textoNombre} text-xs font-medium truncate`}>{usuario?.nombre || "Docente"}</p>
              <p className={`${textoEmail} text-xs truncate`}>{usuario?.email || ""}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-violet-500/20 text-violet-400">
              {usuario?.creditos || 0} créditos
            </span>
          </div>
          <button onClick={cerrarSesion}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* NAVBAR MOBILE */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-30 ${mobileBg} border-b ${borderC} px-4 py-3 flex items-center justify-between transition-colors duration-200`}>
        <Logo />
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className={`p-1.5 rounded-lg border transition ${toggleBtn}`}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setAbierto(!abierto)}
            className={`${dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition`}>
            {abierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {abierto && (
        <div className={`md:hidden fixed inset-0 z-20 ${mobileBg} pt-16 px-4 transition-colors duration-200`}>
          <nav className="space-y-1 mb-4">
            {NAV.map((item) => {
              const activo = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setAbierto(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${activo ? navActivo : navInactivo}`}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className={`border-t ${borderC} pt-4`}>
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold overflow-hidden">
                {usuario?.avatar_url
                  ? <img src={usuario.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className={`${textoNombre} text-sm font-medium`}>{usuario?.nombre || "Docente"}</p>
                <p className={`${textoEmail} text-xs`}>{usuario?.email || ""}</p>
              </div>
            </div>
            <button onClick={cerrarSesion}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  );
}
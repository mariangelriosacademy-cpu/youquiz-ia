"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles, ClipboardList } from "lucide-react";
import { useTheme } from "./theme-context";

export default function DashboardPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [perfil, setPerfil] = useState<any>(null);
  const [stats, setStats] = useState({ examenes: 0 });

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setPerfil(p);
      const { count } = await supabase.from("exams")
        .select("*", { count: "exact", head: true }).eq("docente_id", user.id);
      setStats({ examenes: count || 0 });
    }
    cargar();
  }, []);

  return (
    <div className="min-h-screen youquiz-bg px-4 md:py-8" style={{paddingTop: "80px"}}>
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold youquiz-texto">
            ¡Hola, {perfil?.nombre?.split(" ")[0] || "Docente"}! 👋
          </h1>
          <p className="youquiz-subtexto text-sm mt-0.5">¿Qué quieres hacer hoy?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => router.push("/dashboard/generar")}
            className="bg-violet-600 hover:bg-violet-500 rounded-2xl p-6 text-left transition">
            <Sparkles size={28} className="text-white mb-3" />
            <h3 className="text-white font-semibold text-lg">Generar examen</h3>
            <p className="text-violet-200 text-sm mt-1">Crea un examen completo con IA en segundos</p>
          </button>

          <button onClick={() => router.push("/dashboard/mis-examenes")}
            className="youquiz-card border rounded-2xl p-6 text-left transition hover:border-violet-500/50">
            <ClipboardList size={28} className="text-violet-400 mb-3" />
            <h3 className="youquiz-texto font-semibold text-lg">Mis exámenes</h3>
            <p className="youquiz-subtexto text-sm mt-1">Ver, compartir y gestionar tus exámenes</p>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="youquiz-card border rounded-2xl p-5">
            <p className="youquiz-subtexto text-xs mb-1">Créditos disponibles</p>
            <p className="text-3xl font-bold text-violet-400">{perfil?.creditos || 0}</p>
          </div>
          <div className="youquiz-card border rounded-2xl p-5">
            <p className="youquiz-subtexto text-xs mb-1">Plan actual</p>
            <p className="text-3xl font-bold text-violet-400 capitalize">{perfil?.plan || "free"}</p>
          </div>
          <div className="youquiz-card border rounded-2xl p-5 col-span-2 sm:col-span-1">
            <p className="youquiz-subtexto text-xs mb-1">Exámenes creados</p>
            <p className="text-3xl font-bold youquiz-texto">{stats.examenes}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="youquiz-texto font-semibold">⚡ Compra créditos</p>
            <p className="youquiz-subtexto text-sm mt-0.5">Desde $2 — genera exámenes con IA sin límite de tiempo</p>
          </div>
          <button onClick={() => router.push("/precios")}
            className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
}
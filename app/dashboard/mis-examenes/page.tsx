"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Plus, Eye, Copy, Trash2, CheckCheck, BarChart2 } from "lucide-react";
import { useTheme } from "../theme-context";

export default function MisExamenesPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [examenes, setExamenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => { cargarExamenes(); }, []);

  async function cargarExamenes() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase.from("exams").select("*")
      .eq("docente_id", user.id).order("created_at", { ascending: false });
    setExamenes(data || []);
    setLoading(false);
  }

  async function eliminarExamen(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este examen?")) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("exams").delete().eq("id", id);
    setExamenes(prev => prev.filter(e => e.id !== id));
  }

  function copiarLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  const filtrados = examenes.filter(e =>
    e.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.tema?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen youquiz-bg px-4 pt-20 pb-10 md:pt-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold youquiz-texto">📋 Mis exámenes</h1>
            <p className="youquiz-subtexto text-sm mt-1">
              {examenes.length} examen{examenes.length !== 1 ? "es" : ""} creado{examenes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => router.push("/dashboard/generar")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-2 rounded-xl transition">
            <Plus size={16} /> <span className="hidden sm:inline">Nuevo examen</span><span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 youquiz-subtexto" />
          <input type="text" placeholder="Buscar por título o tema..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="youquiz-input w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
        </div>

        {loading ? (
          <div className="text-center youquiz-subtexto py-20 animate-pulse">Cargando exámenes...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="youquiz-subtexto text-sm">
              {busqueda ? "No encontramos exámenes con esa búsqueda." : "Aún no has creado ningún examen."}
            </p>
            {!busqueda && (
              <button onClick={() => router.push("/dashboard/generar")}
                className="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-xl transition">
                Crear mi primer examen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((examen) => (
              <div key={examen.id} className="youquiz-card border rounded-2xl p-4 transition group hover:border-violet-500/30">
                <div>
                  <h3 className="youquiz-texto font-medium text-sm group-hover:text-violet-400 transition">
                    {examen.titulo}
                  </h3>
                  <p className="youquiz-subtexto text-xs mt-1">Tema: {examen.tema}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="youquiz-subtexto text-xs">{examen.preguntas?.length} preguntas</span>
                    <span className="youquiz-subtexto text-xs">·</span>
                    <span className="youquiz-subtexto text-xs">
                      {new Date(examen.created_at).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <button onClick={() => copiarLink(examen.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-xs transition">
                      {copiado === examen.id ? <><CheckCheck size={11} /> Copiado</> : <><Copy size={11} /> Link</>}
                    </button>
                    <button onClick={() => router.push(`/dashboard/examen/${examen.id}/resultados`)}
                      className="flex items-center gap-1 px-2 py-1 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-lg text-xs transition">
                      <BarChart2 size={11} /> Stats
                    </button>
                    <button onClick={() => router.push(`/dashboard/examen/${examen.id}`)}
                      className="flex items-center gap-1 px-2 py-1 bg-violet-600 text-white rounded-lg text-xs transition">
                      <Eye size={11} /> Ver
                    </button>
                    <button onClick={() => eliminarExamen(examen.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs transition">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
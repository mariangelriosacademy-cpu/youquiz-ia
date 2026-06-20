"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

const ADMIN_EMAIL = "riosfuenmayor2019@gmail.com";

export default function AdminPage() {
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    async function verificar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = "/dashboard";
        return;
      }
      setAutorizado(true);
      cargarComprobantes();
    }
    verificar();
  }, []);

  async function cargarComprobantes() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("comprobantes")
      .select("*, profiles(nombre, email)")
      .order("created_at", { ascending: false });
    setComprobantes(data || []);
    setLoading(false);
  }

  async function aprobar(comprobante: any) {
    setProcesando(comprobante.id);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("profiles")
      .update({ creditos: supabase.rpc("increment_creditos", { user_id: comprobante.user_id, amount: comprobante.creditos }) })
      .eq("id", comprobante.user_id);

    // Incrementar créditos directamente
    const { data: perfil } = await supabase.from("profiles")
      .select("creditos").eq("id", comprobante.user_id).single();
    
    await supabase.from("profiles")
      .update({ creditos: (perfil?.creditos || 0) + comprobante.creditos })
      .eq("id", comprobante.user_id);

    await supabase.from("comprobantes")
      .update({ estado: "aprobado" }).eq("id", comprobante.id);

    setComprobantes(prev => prev.map(c =>
      c.id === comprobante.id ? { ...c, estado: "aprobado" } : c
    ));
    setProcesando(null);
  }

  async function rechazar(id: string) {
    setProcesando(id);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("comprobantes").update({ estado: "rechazado" }).eq("id", id);
    setComprobantes(prev => prev.map(c =>
      c.id === id ? { ...c, estado: "rechazado" } : c
    ));
    setProcesando(null);
  }

  if (!autorizado) return null;

  const pendientes = comprobantes.filter(c => c.estado === "pendiente");
  const procesados = comprobantes.filter(c => c.estado !== "pendiente");

  return (
    <div className="min-h-screen bg-[#0F0F1A] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">🛡️ Panel Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Gestión de comprobantes de pago</p>
          </div>
          <div className="bg-violet-600/20 border border-violet-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-violet-400 text-2xl font-bold">{pendientes.length}</p>
            <p className="text-slate-400 text-xs">pendientes</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="animate-spin text-violet-400 mx-auto" size={24} />
          </div>
        ) : (
          <>
            {/* PENDIENTES */}
            {pendientes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  ⏳ Pendientes ({pendientes.length})
                </h2>
                <div className="space-y-4">
                  {pendientes.map((c) => (
                    <div key={c.id} className="bg-white/5 border border-yellow-500/30 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-white font-medium">{c.profiles?.nombre}</p>
                          <p className="text-slate-400 text-xs">{c.profiles?.email}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="bg-violet-500/20 text-violet-400 text-xs px-2 py-0.5 rounded-full">
                              {c.plan} — {c.monto}
                            </span>
                            <span className="text-yellow-400 text-xs font-medium">
                              +{c.creditos} créditos
                            </span>
                            <span className="text-slate-500 text-xs">
                              {new Date(c.created_at).toLocaleDateString("es-ES", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={c.imagen_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-xs transition hover:border-violet-500">
                            <ExternalLink size={12} /> Ver comprobante
                          </a>
                          <button onClick={() => aprobar(c)} disabled={procesando === c.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-xs transition">
                            {procesando === c.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            Aprobar
                          </button>
                          <button onClick={() => rechazar(c.id)} disabled={procesando === c.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-xs transition">
                            <XCircle size={12} /> Rechazar
                          </button>
                        </div>
                      </div>

                      {/* Preview comprobante */}
                      <div className="mt-4">
                        <img src={c.imagen_url} alt="comprobante"
                          className="max-h-48 rounded-xl object-contain border border-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendientes.length === 0 && (
              <div className="text-center py-12 mb-8">
                <p className="text-5xl mb-3">✅</p>
                <p className="text-slate-400 text-sm">No hay comprobantes pendientes</p>
              </div>
            )}

            {/* PROCESADOS */}
            {procesados.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Historial ({procesados.length})
                </h2>
                <div className="space-y-2">
                  {procesados.map((c) => (
                    <div key={c.id} className={`bg-white/5 border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap ${
                      c.estado === "aprobado" ? "border-green-500/20" : "border-red-500/20"
                    }`}>
                      <div>
                        <p className="text-white text-sm font-medium">{c.profiles?.nombre}</p>
                        <p className="text-slate-500 text-xs">{c.profiles?.email} · {c.plan} · {c.monto}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={c.imagen_url} target="_blank" rel="noreferrer"
                          className="text-xs text-slate-500 hover:text-violet-400 transition">
                          Ver
                        </a>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.estado === "aprobado"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {c.estado === "aprobado" ? "✅ Aprobado" : "❌ Rechazado"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
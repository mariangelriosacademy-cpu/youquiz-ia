"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Clock, CheckCircle, XCircle, Upload } from "lucide-react";

export default function MisPagosPage() {
  const router = useRouter();
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("comprobantes")
        .select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setComprobantes(data || []);
      setLoading(false);
    }
    cargar();
  }, []);

  const estadoIcon = (estado: string) => {
    if (estado === "aprobado") return <CheckCircle size={16} className="text-green-400" />;
    if (estado === "rechazado") return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-yellow-400" />;
  };

  const estadoLabel = (estado: string) => {
    if (estado === "aprobado") return <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✅ Aprobado</span>;
    if (estado === "rechazado") return <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">❌ Rechazado</span>;
    return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">⏳ Pendiente</span>;
  };

  return (
    <div className="min-h-screen youquiz-bg px-4 md:py-8" style={{paddingTop: "80px"}}>
      <div className="max-w-2xl mx-auto">

        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Volver al panel
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold youquiz-texto">💳 Mis pagos</h1>
            <p className="youquiz-subtexto text-sm mt-1">Historial de comprobantes enviados</p>
          </div>
          <button onClick={() => router.push("/precios")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            <Upload size={14} /> Nuevo pago
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 youquiz-subtexto animate-pulse">Cargando...</div>
        ) : comprobantes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💳</div>
            <p className="youquiz-subtexto text-sm mb-4">Aún no has enviado ningún comprobante.</p>
            <button onClick={() => router.push("/precios")}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-xl transition">
              Ver planes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {comprobantes.map((c) => (
              <div key={c.id} className="youquiz-card border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {estadoIcon(c.estado)}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {estadoLabel(c.estado)}
                        <span className="text-xs youquiz-subtexto">
                          {new Date(c.created_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      {c.estado === "aprobado" && (
                        <p className="text-green-400 text-xs mt-1 font-medium">
                          +{c.creditos} créditos agregados ✅
                        </p>
                      )}
                      {c.estado === "pendiente" && (
                        <p className="text-yellow-400 text-xs mt-1">
                          En revisión — menos de 24 horas
                        </p>
                      )}
                      {c.estado === "rechazado" && (
                        <p className="text-red-400 text-xs mt-1">
                          Comprobante rechazado. Contáctanos.
                        </p>
                      )}
                    </div>
                  </div>
                  <a href={c.imagen_url} target="_blank" rel="noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 transition flex-shrink-0">
                    Ver imagen
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs">
            ¿Tienes dudas sobre tu pago? Escríbenos a{" "}
            <span className="text-violet-400">riosfuenmayor2019@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
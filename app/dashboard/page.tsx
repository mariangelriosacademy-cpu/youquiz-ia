"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles, ClipboardList, Copy, Check, MessageCircle } from "lucide-react";
import { useTheme } from "./theme-context";

export default function DashboardPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [perfil, setPerfil] = useState<any>(null);
  const [stats, setStats] = useState({ examenes: 0 });
  const [copiado, setCopiado] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);

  const BANNERS = [
    {
      emoji: "💰",
      titulo: "¡Gana el 50% por cada referido!",
      texto: "Comparte tu link con otros docentes y gana comisión por cada compra Plus o Pro.",
      badge: "Programa de afiliados",
      imagen: "/banner-hotmart.jpg",
      overlay: "from-yellow-900/80 to-amber-900/70",
    },
    {
      emoji: "👩‍🏫",
      titulo: "¿Conoces a otro docente?",
      texto: "Recomienda YouQuiz IA y recibe el 50% de cada venta. Sin límite de referidos.",
      badge: "Gana dinero extra",
      imagen: "/banner-docente1.jpg",
      overlay: "from-violet-900/80 to-indigo-900/70",
    },
    {
      emoji: "🚀",
      titulo: "Tu link, tus ganancias",
      texto: "Cada docente que compre Plus ($4) o Pro ($6) acumula $2 o $3 en tu cuenta Hotmart.",
      badge: "50% de comisión",
      imagen: "/banner-docente2.jpg",
      overlay: "from-cyan-900/80 to-blue-900/70",
    },
  ];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const linkAfiliado = perfil?.id
    ? `https://youquiz-ia.vercel.app/register?ref=${perfil.id.slice(0, 8)}`
    : "";

  async function copiarLink() {
    if (!linkAfiliado) return;
    await navigator.clipboard.writeText(linkAfiliado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const banner = BANNERS[bannerIdx];

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

        {/* BANNER ROTATIVO DE AFILIADOS */}
        <div className="relative mb-4 rounded-2xl overflow-hidden h-44"
          style={{
            backgroundImage: `url(${banner.imagen})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>

          {/* Overlay — pointer-events-none para no bloquear clics */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${banner.overlay}`}
            style={{ pointerEvents: "none" }}
          />

          {/* Botón WhatsApp — encima de todo */}
          <a
            href="https://wa.me/573005062600?text=Hola%2C%20quiero%20unirme%20al%20programa%20de%20afiliados%20de%20YouQuiz%20IA%20%F0%9F%9A%80"
            target="_blank"
            rel="noopener noreferrer"
            style={{ position: "absolute", top: "12px", right: "12px", zIndex: 50 }}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg transition"
          >
            <MessageCircle size={13} />
            Quiero ser afiliado
          </a>

          {/* Contenido */}
          <div className="relative h-full flex flex-col justify-between p-5" style={{ zIndex: 10 }}>
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 backdrop-blur-sm">
                {banner.emoji} {banner.badge}
              </span>
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow">
                {banner.titulo}
              </h3>
              <p className="text-white/80 text-sm mt-0.5 drop-shadow">
                {banner.texto}
              </p>
            </div>

            {linkAfiliado && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/70 truncate font-mono">
                  {linkAfiliado}
                </div>
                <button onClick={copiarLink}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                  {copiado ? <><Check size={12} /> ¡Copiado!</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
            )}
          </div>

          {/* Indicadores de slide */}
          <div style={{ position: "absolute", bottom: "12px", right: "20px", zIndex: 10, display: "flex", gap: "6px" }}>
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                style={{
                  height: "6px",
                  width: i === bannerIdx ? "16px" : "6px",
                  borderRadius: "9999px",
                  background: i === bannerIdx ? "white" : "rgba(255,255,255,0.4)",
                  transition: "all 0.3s",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }} />
            ))}
          </div>
        </div>

        {/* BANNER COMPRAR CRÉDITOS */}
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
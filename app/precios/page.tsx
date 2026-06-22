"use client";

import { useRouter } from "next/navigation";
import { Check, Zap, Gift } from "lucide-react";

const PLANES = [
  {
    id: "starter",
    nombre: "Starter",
    precio: 2,
    creditos: 15,
    color: "border-white/10",
    bgColor: "bg-white/5",
    btnColor: "bg-white/10 hover:bg-white/20 text-white",
    badge: null,
    descripcion: "Para probar YouQuiz IA sin riesgo",
    hotmartLink: "#",
    bonus: false,
  },
  {
    id: "plus",
    nombre: "Plus",
    precio: 4,
    creditos: 35,
    color: "border-violet-500",
    bgColor: "bg-violet-600/10",
    btnColor: "bg-violet-600 hover:bg-violet-500 text-white",
    badge: "⭐ MÁS POPULAR",
    descripcion: "El favorito de los docentes",
    hotmartLink: "#",
    bonus: true,
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 6,
    creditos: 60,
    color: "border-cyan-500/50",
    bgColor: "bg-cyan-600/5",
    btnColor: "bg-cyan-600 hover:bg-cyan-500 text-white",
    badge: "🔥 MEJOR VALOR",
    descripcion: "Para docentes activos",
    hotmartLink: "#",
    bonus: true,
  },
];

const FEATURES = [
  "Generar examen por tema con IA",
  "Examen imprimible con encabezado institucional",
  "Compartir por link con estudiantes",
  "Estudiante ve su nota al terminar",
  "Descarga del examen en PDF",
  "Todos los países de Latinoamérica",
  "Los créditos no vencen nunca",
];

export default function PreciosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0F0F1A] px-4 py-16">
      <div className="max-w-5xl mx-auto">

        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition mb-8">
          ← Volver al dashboard
        </button>

        <div className="text-center mb-4">
          <span className="inline-block bg-violet-600/20 text-violet-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            💳 Sin suscripción — pagas solo cuando necesitas
          </span>
          <h1 className="text-3xl font-bold text-white mb-3">
            Elige tu paquete de créditos
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Cada crédito = 1 examen generado con IA. Sin importar cuántas preguntas tenga. Los créditos no vencen.
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 my-8 flex-wrap">
          {[
            { icon: "⚡", text: "1 crédito = 1 examen" },
            { icon: "♾️", text: "Los créditos no vencen" },
            { icon: "📝", text: "5 a 30 preguntas" },
            { icon: "🔒", text: "Pago seguro con Hotmart" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-slate-400 text-sm">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* BANNER REGALO */}
        <div className="relative mb-8 rounded-2xl overflow-hidden border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-amber-600/5" />
          <div className="relative px-6 py-5 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-3xl">
              🎁
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Gift size={14} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Bonus exclusivo</span>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">
                +55 Prompts Educativos para docentes
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Banco de prompts listos para usar con IA: planificaciones, rúbricas, retroalimentación y más.
                <span className="text-yellow-400 font-medium"> Gratis con Plus y Pro.</span>
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">Plus ⭐</span>
                <span className="bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full">Pro 🔥</span>
              </div>
              <span className="text-slate-500 text-xs">Solo con estos planes</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {PLANES.map((plan) => (
            <div key={plan.id}
              className={`relative ${plan.bgColor} border-2 ${plan.color} rounded-2xl p-6 flex flex-col`}>

              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">{plan.nombre}</h2>
                <p className="text-slate-400 text-xs mt-0.5">{plan.descripcion}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.precio}</span>
                  <span className="text-slate-400 text-sm ml-1">USD</span>
                </div>
                <div className="mt-2 bg-black/20 rounded-xl px-4 py-2 inline-block">
                  <span className="text-2xl font-bold text-violet-400">{plan.creditos}</span>
                  <span className="text-slate-400 text-sm ml-1">créditos</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ${(plan.precio / plan.creditos).toFixed(2)} por examen
                </p>
              </div>

              <ul className="space-y-2.5 mb-4 flex-1">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-xs">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.bonus ? (
                <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
                  <span className="text-lg">🎁</span>
                  <span className="text-yellow-400 text-xs font-medium">+55 Prompts Educativos incluidos</span>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                  <span className="text-lg opacity-30">🎁</span>
                  <span className="text-slate-600 text-xs">Bonus no incluido</span>
                </div>
              )}

              <a
                href={plan.hotmartLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${plan.btnColor}`}>
                <Zap size={14} />
                Comprar ahora
              </a>
            </div>
          ))}
        </div>

        {/* Instrucciones */}
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 mb-6 text-center">
          <p className="text-violet-400 font-semibold text-sm mb-2">📩 ¿Cómo funciona?</p>
          <ol className="text-slate-400 text-xs space-y-1">
            <li>1. Elige tu plan y haz clic en "Comprar ahora"</li>
            <li>2. Completa tu compra de forma segura en Hotmart</li>
            <li>3. Tus créditos se activan automáticamente ✅</li>
            <li>4. Recibes los +55 Prompts en tu correo si compraste Plus o Pro 🎁</li>
          </ol>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Preguntas frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "¿Los créditos vencen?", a: "No. Tus créditos son permanentes, úsalos cuando quieras." },
              { q: "¿Cómo pago?", a: "A través de Hotmart — seguro, rápido y disponible en toda Latinoamérica." },
              { q: "¿Cuántas preguntas puedo poner?", a: "De 5 a 30 preguntas por examen — siempre 1 crédito." },
              { q: "¿Cómo recibo los prompts?", a: "Te llegará el enlace automáticamente a tu correo al comprar Plus o Pro." },
            ].map((item) => (
              <div key={item.q}>
                <p className="text-white text-sm font-medium">{item.q}</p>
                <p className="text-slate-400 text-xs mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-slate-500 text-sm">
            🔒 Pago seguro via Hotmart · Soporte en español · Sin compromisos
          </p>
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition mx-auto">
            ← Volver al dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
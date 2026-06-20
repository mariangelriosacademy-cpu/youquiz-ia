"use client";

import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";

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
    paypalLink: "https://paypal.me/Mari01ve/2",
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
    paypalLink: "https://paypal.me/Mari01ve/4",
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
    paypalLink: "https://paypal.me/Mari01ve/6",
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
            { icon: "💳", text: "Pago único por PayPal" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-slate-400 text-sm">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
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

              <ul className="space-y-2.5 mb-6 flex-1">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-xs">{f}</span>
                  </li>
                ))}
              </ul>

              <a href={plan.paypalLink} target="_blank" rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${plan.btnColor}`}>
                <Zap size={14} />
                Comprar {plan.creditos} créditos
              </a>
            </div>
          ))}
        </div>

        {/* Instrucciones post-pago */}
        {/* Instrucciones post-pago */}
<div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 mb-6 text-center">
  <p className="text-violet-400 font-semibold text-sm mb-1">📩 Activación de créditos</p>
  <p className="text-slate-400 text-xs">
    Una vez completado el pago, envía tu comprobante a{" "}
    <span className="text-white font-medium">riosfuenmayor2019@gmail.com</span>{" "}
    indicando tu correo registrado en YouQuiz IA. Los créditos serán activados en un plazo máximo de 24 horas hábiles.
  </p>
</div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Preguntas frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "¿Los créditos vencen?", a: "No. Tus créditos son permanentes, úsalos cuando quieras." },
              { q: "¿Cómo pago?", a: "Por PayPal — seguro, rápido y disponible en toda Latinoamérica." },
              { q: "¿Cuántas preguntas puedo poner?", a: "De 5 a 30 preguntas por examen — siempre 1 crédito." },
              { q: "¿Puedo comprar más créditos?", a: "Sí, en cualquier momento. Se acumulan con los que ya tienes." },
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
            🔒 Pago seguro via PayPal · Soporte en español · Sin compromisos
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
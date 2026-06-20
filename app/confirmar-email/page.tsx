"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConfirmarEmailPage() {
  const [puntos, setPuntos] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setPuntos(p => p.length >= 3 ? "." : p + ".");
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="YouQuiz IA" className="h-12 w-auto" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          
          {/* Icono animado */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 bg-violet-500/20 rounded-full animate-ping" />
            <div className="relative text-5xl">📬</div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            ¡Revisa tu correo!
          </h1>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta y empezar a generar exámenes con IA.
          </p>

          <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-violet-300 text-xs">
              💡 Si no lo ves en tu bandeja principal, revisa la carpeta de <strong>spam o correo no deseado</strong>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-6">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span>Esperando confirmación{puntos}</span>
          </div>

          <Link href="/login"
            className="w-full inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl py-2.5 text-sm transition">
            Ya confirmé mi correo → Iniciar sesión
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ¿No recibiste el correo?{" "}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 transition">
            Regístrate de nuevo
          </Link>
        </p>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!email) { setError("Escribe tu correo."); return; }
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError("No pudimos enviar el correo. Verifica el email ingresado.");
      } else {
        setSent(true);
      }
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error inesperado.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="text-yellow-400 font-black tracking-tight">You</span><span className="text-violet-400 font-black tracking-tight">Quiz</span>
            <span className="bg-violet-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">IA</span>
          </span>
          <p className="mt-2 text-slate-400 text-sm">Recupera tu contraseña</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <h2 className="text-lg font-semibold text-white">¡Correo enviado!</h2>
              <p className="text-slate-400 text-sm">
                Revisa tu correo, te enviamos un link para restablecer tu contraseña.
              </p>
              <Link href="/login" className="inline-block mt-2 text-violet-400 hover:text-violet-300 text-sm transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white mb-2">¿Olvidaste tu contraseña?</h1>
              <p className="text-slate-400 text-sm mb-6">
                Escribe tu correo y te enviamos un link para restablecerla.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <input
                    id="email" type="email" placeholder="tu@correo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar link de recuperación"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
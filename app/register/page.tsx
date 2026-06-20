"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { register } from "../auth/actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="text-yellow-400 font-black tracking-tight">You</span><span className="text-violet-400 font-black tracking-tight">Quiz</span>
            <span className="bg-violet-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">IA</span>
          </span>
          <p className="mt-2 text-slate-400 text-sm">Crea tu cuenta y empieza a practicar</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-white mb-6">Crear cuenta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nombre completo</label>
              <input id="name" name="name" type="text" autoComplete="name" required placeholder="María González"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Correo electrónico</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@correo.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">Contraseña</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" required placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-300">Confirmar contraseña</label>
              <div className="relative">
                <input id="confirm" name="confirm" type={showConfirm ? "text" : "password"}
                  autoComplete="new-password" required placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2">
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
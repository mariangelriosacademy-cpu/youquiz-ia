export default function ConfirmarEmailPage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="text-yellow-400 font-black tracking-tight">You</span><span className="text-violet-400 font-black tracking-tight">Quiz</span>
            <span className="bg-violet-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">IA</span>
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-xl font-semibold text-white mb-3">¡Revisa tu correo!</h1>
          <p className="text-slate-400 text-sm mb-2">
            Te enviamos un link de confirmación a tu email.
          </p>
          <p className="text-slate-500 text-xs">
            Confirma tu cuenta y luego inicia sesión.
          </p>
        </div>
      </div>
    </main>
  );
}
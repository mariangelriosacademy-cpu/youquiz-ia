"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Upload, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ComprobantePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function seleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("La imagen no puede superar 5MB."); return; }
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function enviarComprobante() {
    if (!archivo) { setError("Selecciona una imagen del comprobante."); return; }
    setSubiendo(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const ext = archivo.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("comprobantes").upload(path, archivo);

    if (uploadError) { setError("Error subiendo la imagen. Intenta de nuevo."); setSubiendo(false); return; }

    const { data: urlData } = supabase.storage.from("comprobantes").getPublicUrl(path);

    const { data: perfil } = await supabase.from("profiles").select("nombre, email").eq("id", user.id).single();

    const { error: dbError } = await supabase.from("comprobantes").insert({
      user_id: user.id,
      plan: "pendiente",
      creditos: 0,
      monto: "por verificar",
      imagen_url: urlData.publicUrl,
      estado: "pendiente",
    });

    if (dbError) { setError("Error enviando el comprobante."); setSubiendo(false); return; }

    setExito(true);
    setSubiendo(false);
  }

  if (exito) {
    return (
      <div className="min-h-screen youquiz-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">¡Comprobante enviado!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Revisaremos tu pago y agregaremos los créditos en menos de 24 horas.
          </p>
          <button onClick={() => router.push("/dashboard")}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 rounded-xl transition">
            Volver al panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen youquiz-bg px-4 md:py-8" style={{paddingTop: "80px"}}>
      <div className="max-w-lg mx-auto">

        <button onClick={() => router.push("/precios")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Volver a precios
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">📤 Subir comprobante</h1>
        <p className="text-slate-400 text-sm mb-6">
          Sube la captura de tu pago y agregaremos tus créditos en menos de 24 horas.
        </p>

        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-4 mb-6">
          <h3 className="text-violet-400 font-semibold text-sm mb-2">📋 Recuerda:</h3>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>• $2 USD = 15 créditos</li>
            <li>• $4 USD = 35 créditos</li>
            <li>• $6 USD = 60 créditos</li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Comprobante de pago</label>
          <div onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              preview ? "border-violet-500/50" : "border-white/10 hover:border-violet-500/50"
            }`}>
            {preview ? (
              <img src={preview} alt="comprobante" className="max-h-48 mx-auto rounded-xl object-contain" />
            ) : (
              <>
                <Upload size={32} className="text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Haz clic para subir la imagen</p>
                <p className="text-slate-600 text-xs mt-1">PNG o JPG — máximo 5MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={seleccionarArchivo} />
          {preview && (
            <button onClick={() => { setArchivo(null); setPreview(null); }}
              className="text-xs text-slate-500 hover:text-red-400 mt-2 transition">
              Cambiar imagen
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button onClick={enviarComprobante} disabled={subiendo || !archivo}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition flex items-center justify-center gap-2">
          {subiendo ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Upload size={16} /> Enviar comprobante</>}
        </button>

        <p className="text-center text-xs text-slate-600 mt-4">
          ¿Dudas? Escríbeme a riosfuenmayor2019@gmail.com
        </p>
      </div>
    </div>
  );
}
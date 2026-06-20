"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Save, Loader2, Mail, Crown, Camera } from "lucide-react";
import { useTheme } from "../theme-context";

export default function PerfilPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [nombre, setNombre] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setPerfil(data);
      setNombre(data?.nombre || "");
      setAvatarUrl(data?.avatar_url || null);
      setLoading(false);
    }
    cargar();
  }, []);

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 2 * 1024 * 1024) { alert("La foto no puede superar 2MB."); return; }
    setUploadingFoto(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = archivo.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, archivo, { upsert: true });
    if (error) { alert("Error subiendo la foto."); setUploadingFoto(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setAvatarUrl(url);
    setUploadingFoto(false);
  }

  async function guardar() {
    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("profiles").update({ nombre }).eq("id", perfil.id);
    setSaving(false);
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  }

  if (loading) return (
    <div className="min-h-screen youquiz-bg flex items-center justify-center">
      <Loader2 className="animate-spin text-violet-400" size={24} />
    </div>
  );

  return (
    <div className="min-h-screen youquiz-bg px-4 py-8">
      <div className="max-w-xl mx-auto">

        <h1 className="text-2xl font-bold youquiz-texto mb-6">👤 Mi perfil</h1>

        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploadingFoto}
              className="absolute bottom-0 right-0 w-7 h-7 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center border-2 border-[var(--bg)] transition">
              {uploadingFoto ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={subirFoto} />
          </div>
          <div>
            <p className="youquiz-texto font-semibold text-lg">{nombre}</p>
            <p className="youquiz-subtexto text-sm">{perfil?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              perfil?.plan === "pro" ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-500/20 text-slate-400"
            }`}>
              {perfil?.plan === "pro" ? "✨ Plan Pro" : "Plan Free"}
            </span>
            <p className="youquiz-subtexto text-xs mt-1">Haz clic en la cámara para cambiar tu foto</p>
          </div>
        </div>

        <div className="youquiz-card border rounded-2xl p-6 space-y-4 mb-5">
          <h2 className="text-sm font-semibold youquiz-subtexto">Información personal</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium youquiz-subtexto">Nombre completo</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="youquiz-input w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium youquiz-subtexto">
              <Mail size={12} className="inline mr-1" /> Correo electrónico
            </label>
            <input value={perfil?.email || ""} disabled
              className="youquiz-input w-full border rounded-lg px-4 py-2.5 text-sm cursor-not-allowed opacity-60" />
            <p className="youquiz-subtexto text-xs">El correo no se puede cambiar</p>
          </div>

          {exito && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
              ✅ Perfil actualizado correctamente
            </div>
          )}

          <button onClick={guardar} disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="youquiz-card border rounded-2xl p-6">
          <h2 className="text-sm font-semibold youquiz-subtexto mb-4">
            <Crown size={14} className="inline mr-1 text-yellow-400" /> Mi plan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="youquiz-texto font-medium">{perfil?.plan === "pro" ? "Pro ✨" : "Free"}</p>
              <p className="youquiz-subtexto text-xs mt-0.5">
                {perfil?.plan === "pro" ? "Tienes acceso a todas las funciones" : `${perfil?.creditos || 0} créditos disponibles`}
              </p>
            </div>
            {perfil?.plan !== "pro" && (
              <button onClick={() => router.push("/precios")}
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition">
                Comprar créditos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
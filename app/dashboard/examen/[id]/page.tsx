"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Copy, Share2, ArrowLeft, CheckCheck, Edit2, Check, X, Copy as CopyIcon, BarChart2 } from "lucide-react";
import { useTheme } from "../../theme-context";

export default function ExamenPage() {
  const { id } = useParams();
  const router = useRouter();
  const { dark } = useTheme();
  const [examen, setExamen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [preguntaEditada, setPreguntaEditada] = useState<any>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [mostrarDuplicar, setMostrarDuplicar] = useState(false);
  const [nivelDuplicar, setNivelDuplicar] = useState("primaria");
  const [duplicando, setDuplicando] = useState(false);

  useEffect(() => { cargar(); }, [id]);

  async function cargar() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("exams").select("*").eq("id", id).single();
    setExamen(data);
    setLoading(false);
  }

  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function compartirWhatsApp() {
    const link = `${window.location.origin}/quiz/${id}`;
    const msg = encodeURIComponent(`Te comparto el examen: ${examen?.titulo}\nResponde aquí: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function editarPregunta(idx: number) {
    setEditandoIdx(idx);
    setPreguntaEditada({ ...examen.preguntas[idx] });
  }

  async function guardarEdicion() {
    if (editandoIdx === null || !preguntaEditada) return;
    setGuardandoEdicion(true);
    const nuevasPreguntas = [...examen.preguntas];
    nuevasPreguntas[editandoIdx] = preguntaEditada;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("exams").update({ preguntas: nuevasPreguntas }).eq("id", id);
    setExamen({ ...examen, preguntas: nuevasPreguntas });
    setEditandoIdx(null);
    setPreguntaEditada(null);
    setGuardandoEdicion(false);
  }

  function cancelarEdicion() {
    setEditandoIdx(null);
    setPreguntaEditada(null);
  }

  async function duplicarConNivel() {
    if (!examen) return;
    setDuplicando(true);
    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: examen.tema, nivel: nivelDuplicar,
          cantidad: examen.preguntas.length,
          tipos: [...new Set(examen.preguntas.map((p: any) => p.tipo))],
        }),
      });
      const data = await res.json();
      if (data.error) { alert("Error al duplicar."); return; }
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: perfil } = await supabase.from("profiles").select("creditos").eq("id", user.id).single();
      if (!perfil || perfil.creditos <= 0) { alert("No tienes créditos."); router.push("/precios"); return; }
      const { data: nuevo } = await supabase.from("exams").insert({
        docente_id: user.id, titulo: `${data.titulo} (${nivelDuplicar})`,
        tema: examen.tema, preguntas: data.preguntas, tipo: "tema",
      }).select().single();
      await supabase.from("profiles").update({ creditos: perfil.creditos - 1 }).eq("id", user.id);
      if (nuevo) router.push(`/dashboard/examen/${nuevo.id}`);
    } catch { alert("Error de conexión."); }
    finally { setDuplicando(false); }
  }

  if (loading) return (
    <div className="min-h-screen youquiz-bg flex items-center justify-center">
      <div className="text-violet-400 animate-pulse">Cargando examen...</div>
    </div>
  );

  if (!examen) return (
    <div className="min-h-screen youquiz-bg flex items-center justify-center">
      <div className="youquiz-subtexto">Examen no encontrado.</div>
    </div>
  );

  return (
    <main className="min-h-screen youquiz-bg px-4 pt-32 pb-8 md:pt-8">
      <div className="max-w-3xl mx-auto">

        <button onClick={() => router.push("/dashboard/mis-examenes")}
          className="flex items-center gap-2 youquiz-subtexto hover:text-violet-400 text-sm mb-6 transition">
          <ArrowLeft size={16} /> Mis exámenes
        </button>

        <div className="youquiz-card border rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold youquiz-texto">{examen.titulo}</h1>
              <p className="youquiz-subtexto text-sm mt-0.5">
                {examen.preguntas?.length} preguntas · {new Date(examen.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
            <button onClick={() => setMostrarDuplicar(!mostrarDuplicar)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs transition flex-shrink-0">
              <CopyIcon size={12} /> Duplicar con otro nivel
            </button>
          </div>

          {mostrarDuplicar && (
            <div className="mb-4 bg-cyan-600/10 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm font-medium text-cyan-400 mb-1">📋 Duplicar con otro nivel educativo</p>
              <p className="youquiz-subtexto text-xs mb-3">Consume 1 crédito.</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs youquiz-subtexto mb-1">Nivel educativo</label>
                  <select value={nivelDuplicar} onChange={(e) => setNivelDuplicar(e.target.value)}
                    className="youquiz-input w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="bachillerato">Bachillerato</option>
                    <option value="universidad">Universidad</option>
                  </select>
                </div>
                <button onClick={duplicarConNivel} disabled={duplicando}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm transition">
                  {duplicando ? "Generando..." : "Duplicar"}
                </button>
                <button onClick={() => setMostrarDuplicar(false)} className="p-2 youquiz-subtexto hover:text-violet-400 transition">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4">
            <p className="text-sm font-medium text-violet-400 mb-2">🔗 Link para estudiantes</p>
            <div className="flex items-center gap-2">
              <code className="youquiz-card flex-1 border text-xs px-3 py-2 rounded-lg truncate youquiz-subtexto">
                {typeof window !== "undefined" ? `${window.location.origin}/quiz/${id}` : ""}
              </code>
              <button onClick={copiarLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg transition whitespace-nowrap">
                {copiado ? <><CheckCheck size={12} /> ¡Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
            <button onClick={compartirWhatsApp}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs rounded-lg transition">
              <Share2 size={12} /> Compartir por WhatsApp
            </button>
            <button onClick={() => router.push(`/dashboard/examen/${id}/resultados`)}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs rounded-lg transition">
              <BarChart2 size={12} /> 📊 Ver resultados de estudiantes
            </button>
          </div>
        </div>

        <div className="youquiz-card border rounded-2xl p-6">
          <h2 className="text-sm font-semibold youquiz-subtexto mb-4">
            Preguntas — <span className="youquiz-subtexto opacity-60">haz clic en ✏️ para editar</span>
          </h2>
          <div className="space-y-3">
            {examen.preguntas?.map((p: any, i: number) => (
              <div key={i} className="youquiz-card border rounded-xl p-4">
                {editandoIdx === i && preguntaEditada ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                      <span className="text-xs text-yellow-400 font-medium">Editando pregunta</span>
                    </div>
                    <textarea value={preguntaEditada.pregunta}
                      onChange={(e) => setPreguntaEditada({ ...preguntaEditada, pregunta: e.target.value })}
                      rows={2} className="youquiz-input w-full border border-yellow-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none" />
                    {preguntaEditada.tipo === "multiple" && preguntaEditada.opciones && (
                      <div className="space-y-1.5">
                        <p className="text-xs youquiz-subtexto">Opciones:</p>
                        {preguntaEditada.opciones.map((op: string, j: number) => (
                          <input key={j} value={op}
                            onChange={(e) => {
                              const nuevas = [...preguntaEditada.opciones];
                              nuevas[j] = e.target.value;
                              setPreguntaEditada({ ...preguntaEditada, opciones: nuevas });
                            }}
                            className="youquiz-input w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs youquiz-subtexto mb-1">Respuesta correcta:</p>
                      <input value={preguntaEditada.respuesta_correcta}
                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_correcta: e.target.value })}
                        className="youquiz-input w-full border border-green-500/30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <p className="text-xs youquiz-subtexto mb-1">Explicación:</p>
                      <textarea value={preguntaEditada.explicacion}
                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, explicacion: e.target.value })}
                        rows={2} className="youquiz-input w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarEdicion} disabled={guardandoEdicion}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-xs transition">
                        <Check size={12} /> {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button onClick={cancelarEdicion}
                        className="youquiz-card flex items-center gap-1.5 px-3 py-1.5 border youquiz-subtexto rounded-lg text-xs transition">
                        <X size={12} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="bg-violet-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="youquiz-texto text-sm mb-2">{p.pregunta}</p>
                      {p.tipo === "multiple" && p.opciones && (
                        <ul className="space-y-1 mb-2">
                          {p.opciones.map((op: string, j: number) => (
                            <li key={j} className="youquiz-subtexto text-xs">{op}</li>
                          ))}
                        </ul>
                      )}
                      {p.tipo === "verdadero_falso" && (
                        <div className="flex gap-4 mb-2">
                          {["Verdadero", "Falso"].map(op => (
                            <span key={op} className="youquiz-subtexto text-xs flex items-center gap-1">
                              <span className="w-3 h-3 border youquiz-border rounded-full" /> {op}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t youquiz-border">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.tipo === "multiple" ? "bg-violet-500/20 text-violet-300" :
                          p.tipo === "verdadero_falso" ? "bg-cyan-500/20 text-cyan-300" :
                          "bg-yellow-500/20 text-yellow-300"
                        }`}>
                          {p.tipo === "multiple" ? "Múltiple" : p.tipo === "verdadero_falso" ? "V/F" : "Abierta"}
                        </span>
                        <span className="text-xs text-green-500">✓ {p.respuesta_correcta}</span>
                      </div>
                    </div>
                    <button onClick={() => editarPregunta(i)}
                      className="flex-shrink-0 p-1.5 youquiz-subtexto hover:text-violet-400 hover:bg-violet-600/10 rounded-lg transition">
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
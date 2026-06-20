"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Loader2, Sparkles, Save, RefreshCw, Printer, Monitor,
  ChevronRight, Download, Copy, Edit2, Check, X
} from "lucide-react";

interface Pregunta {
  id: number;
  tipo: string;
  pregunta: string;
  opciones?: string[];
  respuesta_correcta: string;
  explicacion: string;
}

interface Examen {
  titulo: string;
  preguntas: Pregunta[];
}

const PAISES = [
  { value: "venezuela", label: "🇻🇪 Venezuela", escala: "1-20" },
  { value: "colombia", label: "🇨🇴 Colombia", escala: "1-100" },
  { value: "mexico", label: "🇲🇽 México", escala: "0-10" },
  { value: "argentina", label: "🇦🇷 Argentina", escala: "1-10" },
  { value: "peru", label: "🇵🇪 Perú", escala: "0-20" },
  { value: "chile", label: "🇨🇱 Chile", escala: "1-7" },
  { value: "ecuador", label: "🇪🇨 Ecuador", escala: "0-10" },
  { value: "bolivia", label: "🇧🇴 Bolivia", escala: "0-100" },
  { value: "paraguay", label: "🇵🇾 Paraguay", escala: "1-5" },
  { value: "uruguay", label: "🇺🇾 Uruguay", escala: "1-12" },
  { value: "costa_rica", label: "🇨🇷 Costa Rica", escala: "0-100" },
  { value: "panama", label: "🇵🇦 Panamá", escala: "0-100" },
  { value: "guatemala", label: "🇬🇹 Guatemala", escala: "0-100" },
  { value: "honduras", label: "🇭🇳 Honduras", escala: "0-100" },
  { value: "el_salvador", label: "🇸🇻 El Salvador", escala: "0-10" },
  { value: "nicaragua", label: "🇳🇮 Nicaragua", escala: "0-100" },
  { value: "dominicana", label: "🇩🇴 Rep. Dominicana", escala: "0-100" },
  { value: "cuba", label: "🇨🇺 Cuba", escala: "0-100" },
  { value: "puerto_rico", label: "🇵🇷 Puerto Rico", escala: "0-100" },
  { value: "espana", label: "🇪🇸 España", escala: "0-10" },
  { value: "otro", label: "🌍 Otro", escala: "0-100" },
];

const TIPOS_EXAMEN = [
  {
    icon: "📝",
    label: "Examen escrito",
    desc: "Formato tradicional",
    config: { cantidad: 20, tipos: ["multiple", "verdadero_falso", "abierta"] }
  },
  {
    icon: "✅",
    label: "Quiz rápido",
    desc: "10 preguntas rápidas",
    config: { cantidad: 10, tipos: ["multiple", "verdadero_falso"] }
  },
  {
    icon: "🔤",
    label: "Solo opción múltiple",
    desc: "Todas de selección",
    config: { cantidad: 15, tipos: ["multiple"] }
  },
  {
    icon: "✔️",
    label: "Verdadero / Falso",
    desc: "Solo V/F",
    config: { cantidad: 15, tipos: ["verdadero_falso"] }
  },
  {
    icon: "📖",
    label: "Preguntas abiertas",
    desc: "Desarrollo escrito",
    config: { cantidad: 10, tipos: ["abierta"] }
  },
  {
    icon: "🎯",
    label: "Examen mixto",
    desc: "Todos los tipos",
    config: { cantidad: 15, tipos: ["multiple", "verdadero_falso", "abierta"] }
  },
];

const ASIGNATURAS = [
  { grupo: "Ciencias", opciones: ["Ciencias Naturales", "Biología", "Química", "Física", "Ciencias de la Tierra", "Medio Ambiente"] },
  { grupo: "Matemáticas", opciones: ["Matemáticas", "Álgebra", "Geometría", "Cálculo", "Estadística"] },
  { grupo: "Lenguaje", opciones: ["Lengua y Literatura", "Español", "Comunicación y Lenguaje", "Lectura y Escritura", "Gramática"] },
  { grupo: "Ciencias Sociales", opciones: ["Historia", "Geografía", "Educación Cívica", "Ciencias Sociales", "Filosofía", "Economía", "Sociología"] },
  { grupo: "Idiomas", opciones: ["Inglés", "Francés", "Portugués", "Italiano"] },
  { grupo: "Arte y Cultura", opciones: ["Educación Artística", "Música", "Artes Plásticas", "Teatro", "Danza"] },
  { grupo: "Tecnología", opciones: ["Informática", "Tecnología", "Programación", "Robótica"] },
  { grupo: "Salud y Deporte", opciones: ["Educación Física", "Salud", "Nutrición"] },
  { grupo: "Religión y Ética", opciones: ["Religión", "Ética y Valores", "Educación en Valores"] },
];

const GRADOS = [
  { grupo: "Primaria", opciones: ["1er grado", "2do grado", "3er grado", "4to grado", "5to grado", "6to grado"] },
  { grupo: "Secundaria / Básica", opciones: ["7mo grado / 1er año", "8vo grado / 2do año", "9no grado / 3er año"] },
  { grupo: "Bachillerato / Preparatoria", opciones: ["10mo grado / 4to año", "11vo grado / 5to año", "12vo grado / 6to año"] },
  { grupo: "Universidad", opciones: ["1er semestre", "2do semestre", "3er semestre", "4to semestre", "5to semestre", "6to semestre", "7mo semestre", "8vo semestre"] },
];

function GenerarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState("secundaria");
  const [cantidad, setCantidad] = useState(10);
  const [tipos, setTipos] = useState<string[]>(["multiple"]);
  const [pais, setPais] = useState("venezuela");
  const [modoSalida, setModoSalida] = useState<"interactivo" | "imprimible">("interactivo");
  const [asignatura, setAsignatura] = useState("");
  const [asignaturaPersonalizada, setAsignaturaPersonalizada] = useState("");
  const [grado, setGrado] = useState("");
  const [gradoPersonalizado, setGradoPersonalizado] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [docente, setDocente] = useState("");
  const [seccion, setSeccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examen, setExamen] = useState<Examen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditos, setCreditos] = useState<number | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);

  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [preguntaEditada, setPreguntaEditada] = useState<Pregunta | null>(null);
  const [mostrarDuplicar, setMostrarDuplicar] = useState(false);
  const [nivelDuplicar, setNivelDuplicar] = useState("primaria");
  const [duplicando, setDuplicando] = useState(false);

  const paisInfo = PAISES.find(p => p.value === pais);
  const asignaturaFinal = asignatura === "otra" ? asignaturaPersonalizada : asignatura;
  const gradoFinal = grado === "otro" ? gradoPersonalizado : grado;

  useEffect(() => {
    async function cargarCreditos() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("creditos, nombre").eq("id", user.id).single();
      setCreditos(data?.creditos ?? 0);
      setDocente(data?.nombre || "");
    }
    cargarCreditos();
    const temaParam = searchParams.get("tema");
    const nivelParam = searchParams.get("nivel");
    if (temaParam) setTema(temaParam);
    if (nivelParam) setNivel(nivelParam);
  }, []);

  function aplicarTipoExamen(tipo: typeof TIPOS_EXAMEN[0]) {
    setTipoSeleccionado(tipo.label);
    setCantidad(tipo.config.cantidad);
    setTipos(tipo.config.tipos);
    // Scroll suave al campo de tema
    document.getElementById("campo-tema")?.focus();
  }

  function toggleTipo(tipo: string) {
    setTipos(prev => prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]);
  }

  async function generarExamen() {
    if (!tema.trim()) { setError("Escribe un tema para el examen."); return; }
    if (tipos.length === 0) { setError("Selecciona al menos un tipo de pregunta."); return; }
    setError(null);
    setLoading(true);
    setExamen(null);
    setEditandoIdx(null);
    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, nivel, cantidad, tipos, pais, asignatura: asignaturaFinal, grado: gradoFinal }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setExamen(data);
      setMostrarDuplicar(false);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function guardarExamen() {
    if (!examen) return;
    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: perfil } = await supabase.from("profiles").select("creditos").eq("id", user.id).single();
    if (!perfil || perfil.creditos <= 0) {
      setError("No tienes créditos disponibles.");
      setSaving(false);
      router.push("/precios");
      return;
    }

    const { data, error } = await supabase.from("exams").insert({
      docente_id: user.id,
      titulo: examen.titulo,
      tema,
      preguntas: examen.preguntas,
      tipo: "tema",
      docente_nombre: docente,
      asignatura: asignaturaFinal,
      grado: gradoFinal,
    }).select().single();

    if (error) { setError("No se pudo guardar el examen."); setSaving(false); return; }

    await supabase.from("profiles").update({ creditos: perfil.creditos - 1 }).eq("id", user.id);
    setCreditos(prev => (prev !== null ? prev - 1 : null));
    router.push(`/dashboard/examen/${data.id}`);
  }

  async function duplicarConNivel() {
    if (!examen) return;
    setDuplicando(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, nivel: nivelDuplicar, cantidad, tipos, pais, asignatura: asignaturaFinal, grado: gradoFinal }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setExamen(data);
      setNivel(nivelDuplicar);
      setMostrarDuplicar(false);
    } catch {
      setError("Error al duplicar. Intenta de nuevo.");
    } finally {
      setDuplicando(false);
    }
  }

  function editarPregunta(idx: number) {
    setEditandoIdx(idx);
    setPreguntaEditada({ ...examen!.preguntas[idx] });
  }

  function guardarEdicion() {
    if (!examen || editandoIdx === null || !preguntaEditada) return;
    const nuevasPreguntas = [...examen.preguntas];
    nuevasPreguntas[editandoIdx] = preguntaEditada;
    setExamen({ ...examen, preguntas: nuevasPreguntas });
    setEditandoIdx(null);
    setPreguntaEditada(null);
  }

  function cancelarEdicion() {
    setEditandoIdx(null);
    setPreguntaEditada(null);
  }

  async function descargarPDF() {
    if (!examen) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margen = 20;
    let y = margen;
    const ancho = doc.internal.pageSize.getWidth() - margen * 2;

    doc.setFillColor(108, 63, 196);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(examen.titulo, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
    if (institucion) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(institucion, doc.internal.pageSize.getWidth() / 2, 26, { align: "center" });
    }

    y = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(243, 238, 255);
    doc.rect(margen, y, ancho, 30, "F");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    const col1 = margen + 4;
    const col2 = margen + ancho / 2 + 4;
    if (docente) doc.text(`Docente: ${docente}`, col1, y + 8);
    if (asignaturaFinal) doc.text(`Asignatura: ${asignaturaFinal}`, col2, y + 8);
    if (gradoFinal) doc.text(`Grado/Año: ${gradoFinal}`, col1, y + 16);
    if (seccion) doc.text(`Sección: ${seccion}`, col2, y + 16);
    doc.text(`Fecha: _______________`, col1, y + 24);
    doc.text(`Nombre: _______________________________`, col2, y + 24);
    y += 38;

    doc.setFontSize(8);
    doc.setTextColor(108, 63, 196);
    doc.text(`Escala: ${paisInfo?.escala} pts`, margen, y);
    y += 10;

    examen.preguntas.forEach((p, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFillColor(108, 63, 196);
      doc.circle(margen + 4, y + 1, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, margen + 4, y + 2, { align: "center" });
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(p.pregunta, ancho - 12);
      doc.text(lines, margen + 12, y + 2);
      y += lines.length * 5 + 4;
      if (p.tipo === "multiple" && p.opciones) {
        p.opciones.forEach(op => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFillColor(200, 200, 200);
          doc.rect(margen + 12, y - 3, 3, 3, "F");
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          doc.text(op, margen + 18, y);
          y += 6;
        });
        y += 2;
      }
      if (p.tipo === "verdadero_falso") {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.circle(margen + 16, y - 2, 2.5, "F");
        doc.text("Verdadero", margen + 21, y);
        doc.circle(margen + 48, y - 2, 2.5, "F");
        doc.text("Falso", margen + 53, y);
        y += 8;
      }
      if (p.tipo === "abierta") {
        doc.setDrawColor(180, 180, 180);
        for (let l = 0; l < 3; l++) {
          doc.line(margen + 12, y + l * 7, margen + ancho, y + l * 7);
        }
        y += 24;
      }
      y += 4;
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
      doc.setPage(pg);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generado con YouQuiz IA", margen, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Página ${pg} de ${totalPages}`, doc.internal.pageSize.getWidth() - margen, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }
    doc.save(`${examen.titulo}.pdf`);
  }

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
      <div className="min-h-screen bg-[#0F0F1A]">
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

          {/* SIDEBAR */}
          <aside className="no-print w-56 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-8">

              {creditos !== null && (
                <div className="mb-4 bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Tus créditos</p>
                  <p className="text-2xl font-bold text-violet-400">{creditos}</p>
                  {creditos <= 3 && (
                    <button onClick={() => router.push("/precios")}
                      className="mt-1 text-xs text-yellow-400 hover:text-yellow-300 transition">
                      ⚡ Comprar más
                    </button>
                  )}
                </div>
              )}

              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Tipo de examen</h3>
              <div className="space-y-1">
                {TIPOS_EXAMEN.map((tipo) => (
                  <button key={tipo.label} onClick={() => aplicarTipoExamen(tipo)}
                    className={`w-full text-left p-2 rounded-lg transition group ${
                      tipoSeleccionado === tipo.label
                        ? "bg-violet-600/30 border border-violet-500/40"
                        : "hover:bg-violet-600/20"
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tipo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium transition truncate ${
                          tipoSeleccionado === tipo.label ? "text-violet-400" : "text-white group-hover:text-violet-400"
                        }`}>{tipo.label}</p>
                        <p className="text-xs text-slate-600 truncate">{tipo.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">País</h3>
                <select value={pais} onChange={(e) => setPais(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {PAISES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {paisInfo && (
                  <div className="mt-2 bg-violet-600/10 border border-violet-500/20 rounded-lg px-2 py-1.5">
                    <p className="text-xs text-slate-500">Escala</p>
                    <p className="text-sm font-bold text-violet-400">{paisInfo.escala} pts</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* CONTENIDO */}
          <div className="flex-1">

            <div className="no-print mb-5">
              <h1 className="text-xl font-bold text-white">✨ Generar examen con IA</h1>
              <p className="text-slate-400 text-xs mt-1">
                {tipoSeleccionado
                  ? `Modo: ${tipoSeleccionado} · ${cantidad} preguntas configuradas`
                  : "Selecciona un tipo de examen o configura manualmente."}
              </p>
            </div>

            <div className="no-print flex gap-3 mb-4">
              {[
                { value: "interactivo", icon: <Monitor size={14} />, label: "Interactivo" },
                { value: "imprimible", icon: <Printer size={14} />, label: "Imprimible / PDF" },
              ].map(m => (
                <button key={m.value} onClick={() => setModoSalida(m.value as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition ${
                    modoSalida === m.value ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500"
                  }`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            <div className="no-print bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
              <div className="space-y-4">

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Tema del examen</label>
                  <textarea id="campo-tema" rows={2} placeholder="Ej: La fotosíntesis, Fracciones, Segunda Guerra Mundial..."
                    value={tema} onChange={(e) => setTema(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Asignatura</label>
                    <select value={asignatura} onChange={(e) => setAsignatura(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="">Selecciona...</option>
                      {ASIGNATURAS.map(g => (
                        <optgroup key={g.grupo} label={g.grupo}>
                          {g.opciones.map(o => <option key={o}>{o}</option>)}
                        </optgroup>
                      ))}
                      <option value="otra">Otra (escribir)</option>
                    </select>
                    {asignatura === "otra" && (
                      <input placeholder="Escribe la asignatura" value={asignaturaPersonalizada}
                        onChange={(e) => setAsignaturaPersonalizada(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mt-1" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Grado / Año</label>
                    <select value={grado} onChange={(e) => setGrado(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="">Selecciona...</option>
                      {GRADOS.map(g => (
                        <optgroup key={g.grupo} label={g.grupo}>
                          {g.opciones.map(o => <option key={o}>{o}</option>)}
                        </optgroup>
                      ))}
                      <option value="otro">Otro (escribir)</option>
                    </select>
                    {grado === "otro" && (
                      <input placeholder="Escribe el grado" value={gradoPersonalizado}
                        onChange={(e) => setGradoPersonalizado(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mt-1" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Nivel educativo</label>
                    <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="bachillerato">Bachillerato</option>
                      <option value="universidad">Universidad</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Cantidad de preguntas</label>
                    <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}
                      className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                      {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} preguntas</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Tipos de preguntas</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "multiple", label: "Opción múltiple" },
                      { value: "verdadero_falso", label: "Verdadero / Falso" },
                      { value: "abierta", label: "Pregunta abierta" },
                    ].map((tipo) => (
                      <button key={tipo.value} type="button" onClick={() => toggleTipo(tipo.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                          tipos.includes(tipo.value) ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500"
                        }`}>
                        {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-violet-500/20 bg-violet-600/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-violet-400">🏫 Datos institucionales</h3>
                  <input placeholder="Nombre de la institución (opcional)" value={institucion}
                    onChange={(e) => setInstitucion(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Nombre del docente" value={docente}
                      onChange={(e) => setDocente(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input placeholder="Sección" value={seccion}
                      onChange={(e) => setSeccion(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
                )}

                <button onClick={generarExamen} disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Generando...</> : <><Sparkles size={16} /> Generar examen con IA</>}
                </button>
              </div>
            </div>

            {examen && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

                {modoSalida === "imprimible" && (
                  <div className="mb-5 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-5 py-4">
                      {institucion && <p className="text-white/80 text-sm text-center">{institucion}</p>}
                      <h2 className="text-white text-base font-bold text-center mt-1">{examen.titulo}</h2>
                    </div>
                    <div className="bg-violet-600/10 border border-violet-500/20 px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {docente && <p className="text-xs text-slate-300"><span className="text-slate-500">Docente:</span> {docente}</p>}
                      {asignaturaFinal && <p className="text-xs text-slate-300"><span className="text-slate-500">Asignatura:</span> {asignaturaFinal}</p>}
                      {gradoFinal && <p className="text-xs text-slate-300"><span className="text-slate-500">Grado:</span> {gradoFinal}</p>}
                      {seccion && <p className="text-xs text-slate-300"><span className="text-slate-500">Sección:</span> {seccion}</p>}
                      <p className="text-xs text-slate-300"><span className="text-slate-500">Fecha:</span> _______________</p>
                      <p className="text-xs text-slate-300"><span className="text-slate-500">Nombre:</span> _______________________</p>
                    </div>
                    <div className="bg-violet-600/5 px-5 py-1.5 border-t border-violet-500/10">
                      <p className="text-xs text-violet-400">Escala: <strong>{paisInfo?.escala} puntos</strong></p>
                    </div>
                  </div>
                )}

                <div className="no-print flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-white">{examen.titulo}</h2>
                    <p className="text-xs text-slate-400">{examen.preguntas.length} preguntas · {paisInfo?.escala} pts</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={generarExamen} disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-xs transition">
                      <RefreshCw size={12} /> Regenerar
                    </button>
                    <button onClick={() => setMostrarDuplicar(!mostrarDuplicar)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs transition">
                      <Copy size={12} /> Duplicar con otro nivel
                    </button>
                    {modoSalida === "imprimible" ? (
                      <>
                        <button onClick={() => window.print()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-xs transition">
                          <Printer size={12} /> Imprimir
                        </button>
                        <button onClick={descargarPDF}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs transition">
                          <Download size={12} /> Descargar PDF
                        </button>
                      </>
                    ) : (
                      <button onClick={guardarExamen} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-xs transition">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                    )}
                  </div>
                </div>

                {mostrarDuplicar && (
                  <div className="no-print mb-4 bg-cyan-600/10 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-sm font-medium text-cyan-400 mb-3">📋 Duplicar examen con otro nivel</p>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1">Nuevo nivel educativo</label>
                        <select value={nivelDuplicar} onChange={(e) => setNivelDuplicar(e.target.value)}
                          className="w-full bg-[#1a1a2e] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                          <option value="primaria">Primaria</option>
                          <option value="secundaria">Secundaria</option>
                          <option value="bachillerato">Bachillerato</option>
                          <option value="universidad">Universidad</option>
                        </select>
                      </div>
                      <button onClick={duplicarConNivel} disabled={duplicando}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm transition">
                        {duplicando ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                        {duplicando ? "Generando..." : "Duplicar"}
                      </button>
                      <button onClick={() => setMostrarDuplicar(false)} className="p-2 text-slate-400 hover:text-white transition">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {examen.preguntas.map((p, i) => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {editandoIdx === i && preguntaEditada ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                            <span className="text-xs text-yellow-400 font-medium">Editando pregunta</span>
                          </div>
                          <textarea value={preguntaEditada.pregunta}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, pregunta: e.target.value })}
                            rows={2}
                            className="w-full bg-white/5 border border-yellow-500/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none" />
                          {preguntaEditada.tipo === "multiple" && preguntaEditada.opciones && (
                            <div className="space-y-1.5">
                              <p className="text-xs text-slate-400">Opciones:</p>
                              {preguntaEditada.opciones.map((op, j) => (
                                <input key={j} value={op}
                                  onChange={(e) => {
                                    const nuevas = [...preguntaEditada.opciones!];
                                    nuevas[j] = e.target.value;
                                    setPreguntaEditada({ ...preguntaEditada, opciones: nuevas });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                              ))}
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Respuesta correcta:</p>
                            <input value={preguntaEditada.respuesta_correcta}
                              onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_correcta: e.target.value })}
                              className="w-full bg-white/5 border border-green-500/30 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Explicación:</p>
                            <textarea value={preguntaEditada.explicacion}
                              onChange={(e) => setPreguntaEditada({ ...preguntaEditada, explicacion: e.target.value })}
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={guardarEdicion}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs transition">
                              <Check size={12} /> Guardar cambios
                            </button>
                            <button onClick={cancelarEdicion}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-xs transition">
                              <X size={12} /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <span className="bg-violet-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-white text-sm mb-2">{p.pregunta}</p>
                            {p.tipo === "multiple" && p.opciones && (
                              <ul className="space-y-1.5 mb-2">
                                {p.opciones.map((op, j) => (
                                  <li key={j} className="flex items-center gap-2 text-slate-400 text-xs">
                                    <span className="w-4 h-4 border border-slate-600 rounded flex-shrink-0" />
                                    {op}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {p.tipo === "verdadero_falso" && (
                              <div className="flex gap-6 mb-2">
                                {["Verdadero", "Falso"].map(op => (
                                  <label key={op} className="flex items-center gap-2 text-slate-400 text-xs">
                                    <span className="w-4 h-4 border border-slate-600 rounded-full flex-shrink-0" />
                                    {op}
                                  </label>
                                ))}
                              </div>
                            )}
                            {p.tipo === "abierta" && (
                              <div className="mt-1 space-y-2">
                                {[0, 1, 2].map(l => <div key={l} className="border-b border-dashed border-slate-700 pb-3" />)}
                              </div>
                            )}
                            {modoSalida === "interactivo" && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  p.tipo === "multiple" ? "bg-violet-500/20 text-violet-300" :
                                  p.tipo === "verdadero_falso" ? "bg-cyan-500/20 text-cyan-300" :
                                  "bg-yellow-500/20 text-yellow-300"
                                }`}>
                                  {p.tipo === "multiple" ? "Múltiple" : p.tipo === "verdadero_falso" ? "V/F" : "Abierta"}
                                </span>
                                <span className="text-xs text-green-400">✓ {p.respuesta_correcta}</span>
                              </div>
                            )}
                          </div>
                          <button onClick={() => editarPregunta(i)}
                            className="no-print flex-shrink-0 p-1.5 text-slate-600 hover:text-violet-400 hover:bg-violet-600/10 rounded-lg transition">
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="no-print flex gap-3 mt-4">
                  <button onClick={generarExamen} disabled={loading}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Regenerar
                  </button>
                  {modoSalida === "imprimible" ? (
                    <>
                      <button onClick={() => window.print()}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2">
                        <Printer size={14} /> Imprimir
                      </button>
                      <button onClick={descargarPDF}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2">
                        <Download size={14} /> Descargar PDF
                      </button>
                    </>
                  ) : (
                    <button onClick={guardarExamen} disabled={saving}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {saving ? "Guardando..." : "Guardar examen"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default function GenerarPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-violet-400 animate-pulse">Cargando...</div>
      </div>
    }>
      <GenerarPage />
    </Suspense>
  );
}